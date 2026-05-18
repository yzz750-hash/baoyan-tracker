import hashlib
import httpx
import datetime
import json
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from config import WEBHOOK_URL, WEBHOOK_SECRET
from pdf_parser import find_pdf_links, process_pdf


def scrape_notices(list_url, detail_pattern, base_domain, uni_id, uni_name, list_selector="a[href]", max_items=10):
    """通用的爬虫脚手架"""
    print(f"[crawl] 开始抓取 {uni_name} 通知...")
    resp = httpx.get(list_url, timeout=30, follow_redirects=True)
    resp.encoding = "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")
    results = []

    for a_tag in soup.select(list_selector):
        href = a_tag.get("href", "")
        title = a_tag.get("title", "") or a_tag.get_text(strip=True)
        if not title or len(title) < 5:
            continue
        if detail_pattern not in href:
            continue

        full_url = urljoin(list_url if list_url.endswith("/") else list_url + "/", href)
        publish_date = datetime.datetime.now().isoformat() + "Z"
        raw = f"{uni_id}{title}{publish_date}"
        hash_val = hashlib.md5(raw.encode()).hexdigest()

        item = {"title": title.strip(), "url": full_url, "publishDate": publish_date, "hash": hash_val, "summary": None}

        try:
            detail = httpx.get(full_url, timeout=15, follow_redirects=True)
            detail.encoding = "utf-8"
            pdf_links = find_pdf_links(detail.text, full_url)
            if pdf_links:
                print(f"  [pdf] {title[:40]} → {len(pdf_links)} 个附件")
                pdf_result = process_pdf(pdf_links[0])
                if pdf_result:
                    item["extractedData"] = pdf_result
                    item["summary"] = json.dumps(pdf_result, ensure_ascii=False)
            else:
                print(f"       {title[:40]}")
        except Exception as e:
            print(f"       {title[:40]} ({str(e)[:30]})")

        results.append(item)
        if len(results) >= max_items:
            break

    print(f"[crawl] 抓取到 {len(results)} 条通知")
    return results


def fetch_tsinghua_news(uni_id, uni_name):
    return scrape_notices(
        list_url="https://www.cs.tsinghua.edu.cn/index/tzgg.htm",
        detail_pattern="../info/",
        base_domain="https://www.cs.tsinghua.edu.cn",
        uni_id=uni_id,
        uni_name=uni_name,
        list_selector="ul li a[href]",
    )


def fetch_shisu_news(uni_id, uni_name):
    """上海外国语大学 yz.shisu.edu.cn — 硕士招生"""
    return scrape_notices(
        list_url="https://yz.shisu.edu.cn/8755/list.htm",
        detail_pattern="page.htm",
        base_domain="https://yz.shisu.edu.cn",
        uni_id=uni_id,
        uni_name=uni_name,
        list_selector="a[href*=\"page.htm\"]",
    )


def fetch_bfsu_news(uni_id, uni_name):
    """北京外国语大学 graduate.bfsu.edu.cn — 硕士招生"""
    return scrape_notices(
        list_url="https://graduate.bfsu.edu.cn/zsxx/sszs.htm",
        detail_pattern="info/",
        base_domain="https://graduate.bfsu.edu.cn",
        uni_id=uni_id,
        uni_name=uni_name,
        list_selector="a[href*=\"info/\"]",
    )


def push_to_webhook(uni_id, data):
    print(f"[push] 推送 {len(data)} 条到 Webhook...")
    payload = {"universityId": uni_id, "notifications": data}
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
    # 清华大学计算机
    for n in fetch_tsinghua_news("cmp6mqk9j0000d579yfsuu157", "清华大学计算机系"):
        push_to_webhook("cmp6mqk9j0000d579yfsuu157", [n])

    # 上海外国语大学 - 两个专业共享通知
    shisu_id = "cmpajf3kc000011awfivaf6ea"
    for n in fetch_shisu_news(shisu_id, "上海外国语大学"):
        push_to_webhook(shisu_id, [n])

    # 北京外国语大学 - 两个专业共享通知
    bfsu_id = "cmpajhqqu0000yei4cty09dam"
    for n in fetch_bfsu_news(bfsu_id, "北京外国语大学"):
        push_to_webhook(bfsu_id, [n])
