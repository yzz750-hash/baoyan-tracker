import hashlib
import httpx
import datetime
from config import WEBHOOK_URL, WEBHOOK_SECRET, UNIVERSITY_ID, UNIVERSITY_NAME

def fetch_tsinghua_news():
    print(f"[crawl] 开始抓取 {UNIVERSITY_NAME} 通知...")
    url = "https://www.cs.tsinghua.edu.cn/index/tzgg.htm"
    resp = httpx.get(url, timeout=30, follow_redirects=True)
    resp.encoding = "utf-8"
    html = resp.text

    import re
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
            results.append({
                "title": title,
                "url": href,
                "publishDate": publish_date,
                "hash": hash_val,
                "summary": None,
            })
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
            timeout=10,
        )
        print(f"[ok] 状态码: {resp.status_code}")
        print(f"[result] {resp.json()}")
    except Exception as e:
        print(f"[err] 推送失败: {e}")
        print("[warn] 确保 Next.js dev server 在 localhost:3000 运行")


if __name__ == "__main__":
    news = fetch_tsinghua_news()
    if news:
        push_to_webhook(news)
    else:
        print("[warn] 没有抓取到通知")
