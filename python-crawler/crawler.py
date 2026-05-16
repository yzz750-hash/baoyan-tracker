import hashlib
import httpx
import datetime
import re
from config import WEBHOOK_URL, WEBHOOK_SECRET, UNIVERSITY_ID, UNIVERSITY_NAME
from pdf_parser import find_pdf_links, process_pdf


def fetch_tsinghua_news():
    print(f"[crawl] 开始抓取 {UNIVERSITY_NAME} 通知...")
    url = "https://www.cs.tsinghua.edu.cn/index/tzgg.htm"
    resp = httpx.get(url, timeout=30, follow_redirects=True)
    resp.encoding = "utf-8"
    html = resp.text

    pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>'
    links = re.findall(pattern, html)

    results = []
    count = 0
    for href, title in links:
        title = title.strip()
        href = href.strip()
        if not title or len(title) < 5:
            continue
        if href.endswith(".htm") or ".htm" in href:
            if not href.startswith("http"):
                href = f"https://www.cs.tsinghua.edu.cn/{href.lstrip('/')}"
            publish_date = datetime.datetime.now().isoformat() + "Z"
            raw = f"{UNIVERSITY_ID}{title}{publish_date}"
            hash_val = hashlib.md5(raw.encode()).hexdigest()

            item = {
                "title": title,
                "url": href,
                "publishDate": publish_date,
                "hash": hash_val,
                "summary": None,
            }

            # 尝试获取通知详情页并检测 PDF 附件
            try:
                detail_resp = httpx.get(href, timeout=15, follow_redirects=True)
                detail_resp.encoding = "utf-8"
                pdf_links = find_pdf_links(detail_resp.text, href)
                if pdf_links:
                    print(f"[crawl] {title} → 发现 {len(pdf_links)} 个 PDF 附件")
                    pdf_result = process_pdf(pdf_links[0])
                    if pdf_result:
                        item["summary"] = pdf_result
            except Exception as e:
                print(f"[crawl] 详情页访问失败 {href[:50]}: {e}")

            results.append(item)
            count += 1
            if count >= 10:
                break

    print(f"[crawl] 抓取到 {len(results)} 条通知")
    return results


def push_to_webhook(data):
    print(f"[push] 推送 {len(data)} 条到 Webhook...")
    payload = {"universityId": UNIVERSITY_ID, "notifications": data}
    try:
        resp = httpx.post(
            WEBHOOK_URL,
            json=payload,
            headers={"Authorization": f"Bearer {WEBHOOK_SECRET}"},
            timeout=30,
        )
        print(f"[ok] 状态码: {resp.status_code}")
        print(f"[result] {resp.json()}")
    except Exception as e:
        print(f"[err] 推送失败: {e}")


if __name__ == "__main__":
    news = fetch_tsinghua_news()
    if news:
        push_to_webhook(news)
    else:
        print("[warn] 没有抓取到通知")
