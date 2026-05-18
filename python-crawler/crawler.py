import hashlib
import httpx
import datetime
import re
from bs4 import BeautifulSoup
from config import WEBHOOK_URL, WEBHOOK_SECRET, UNIVERSITY_ID, UNIVERSITY_NAME
from pdf_parser import find_pdf_links, process_pdf


def fetch_tsinghua_news():
    print(f"[crawl] 开始抓取 {UNIVERSITY_NAME} 通知...")
    url = "https://www.cs.tsinghua.edu.cn/index/tzgg.htm"
    resp = httpx.get(url, timeout=30, follow_redirects=True)
    resp.encoding = "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")

    results = []

    for li in soup.select("ul li"):
        a_tag = li.find("a", href=True)
        if not a_tag:
            continue
        href = a_tag.get("href", "")
        title = a_tag.get("title", "") or a_tag.get_text(strip=True)
        if not title or len(title) < 5:
            continue
        if "../info/" not in href:
            continue

        full_url = f"https://www.cs.tsinghua.edu.cn/{href.lstrip('../')}"
        publish_date = datetime.datetime.now().isoformat() + "Z"
        raw = f"{UNIVERSITY_ID}{title}{publish_date}"
        hash_val = hashlib.md5(raw.encode()).hexdigest()

        item = {
            "title": title.strip(),
            "url": full_url,
            "publishDate": publish_date,
            "hash": hash_val,
            "summary": None,
        }

        # 详情页检测 PDF 附件
        try:
            detail = httpx.get(full_url, timeout=15, follow_redirects=True)
            detail.encoding = "utf-8"
            pdf_links = find_pdf_links(detail.text, full_url)
            if pdf_links:
                print(f"  [pdf] {title[:40]} → {len(pdf_links)} 个附件")
                pdf_result = process_pdf(pdf_links[0])
                if pdf_result:
                    import json
                    item["extractedData"] = pdf_result
                    item["summary"] = json.dumps(pdf_result, ensure_ascii=False)
            else:
                print(f"       {title[:40]}")
        except Exception as e:
            print(f"       {title[:40]} (详情页: {str(e)[:30]})")

        results.append(item)
        if len(results) >= 10:
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
