import re
import httpx
import tempfile
import os
import json
from typing import Optional
from urllib.parse import urljoin
from config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL


def find_pdf_links(html: str, base_url: str) -> list[str]:
    """从 HTML 中提取 PDF 链接"""
    pdf_links = []
    patterns = [
        r'href=["\']([^"\']+\.pdf)["\']',
        r'href=["\']([^"\']+)["\'][^>]*>.*?\.pdf\s*<',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
        for m in matches:
            url = m if m.startswith("http") else urljoin(base_url, m)
            if url not in pdf_links:
                pdf_links.append(url)
    return pdf_links


def download_pdf(url: str) -> Optional[bytes]:
    """下载 PDF 文件"""
    try:
        resp = httpx.get(url, timeout=30, follow_redirects=True)
        if resp.status_code == 200 and resp.content[:4] == b"%PDF":
            return resp.content
    except Exception as e:
        print(f"[pdf] 下载失败 {url}: {e}")
    return None


def extract_text_with_pdfparse(pdf_bytes: bytes) -> Optional[str]:
    """使用 pdf-parse 提取文字（适合数字 PDF）"""
    try:
        import pdfplumber
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
            f.write(pdf_bytes)
            tmp_path = f.name
        text_parts = []
        with pdfplumber.open(tmp_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        os.unlink(tmp_path)
        result = "\n".join(text_parts)
        if len(result.strip()) > 20:
            return result
        return None
    except Exception as e:
        print(f"[pdf] pdfplumber 解析失败: {e}")
        return None


def extract_text_with_ocr(pdf_bytes: bytes) -> Optional[str]:
    """使用 PaddleOCR 提取文字（适合扫描件 PDF）"""
    try:
        from paddleocr import PaddleOCR
        import fitz  # PyMuPDF

        ocr = PaddleOCR(use_angle_cls=True, lang="ch", show_log=False)
        text_parts = []

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
            f.write(pdf_bytes)
            pdf_path = f.name

        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")

            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as img_f:
                img_f.write(img_bytes)
                img_path = img_f.name

            result = ocr.ocr(img_path, cls=True)
            if result and result[0]:
                for line in result[0]:
                    text_parts.append(line[1][0])
            os.unlink(img_path)

        doc.close()
        os.unlink(pdf_path)

        return "\n".join(text_parts)
    except ImportError:
        print("[pdf] PaddleOCR 未安装，跳过 OCR")
        return None
    except Exception as e:
        print(f"[pdf] OCR 解析失败: {e}")
        return None


def extract_structured_with_llm(text: str) -> Optional[dict]:
    """使用 LLM 提取结构化信息"""
    system_prompt = """你是一个保研通知解析助手。从通知文本中提取结构化信息，以 JSON 格式返回。
字段说明：
- application_deadline: 申请截止日期 (YYYY-MM-DD 格式)
- interview_date: 面试日期 (YYYY-MM-DD 格式，如果没有则为 null)
- required_documents: 所需材料清单 (字符串数组)
- tuition_fees: 学费信息 (如果没有则为 null)
- target_program: 目标专业 (如果没有则为 null)
- summary: 一句话概述通知核心内容

如果某字段没有找到信息，设为 null。只返回 JSON，不要多余文字。"""

    try:
        resp = httpx.post(
            f"{LLM_BASE_URL}/chat/completions",
            json={
                "model": LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"请分析以下通知：\n\n{text[:8000]}"},
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            },
            headers={"Authorization": f"Bearer {LLM_API_KEY}"},
            timeout=60,
        )
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        print(f"[llm] 结构化提取失败: {e}")
        return None


def process_pdf(pdf_url: str) -> Optional[dict]:
    """完整流程：下载 → 解析 → LLM 结构化"""
    print(f"[pdf] 处理: {pdf_url}")

    pdf_bytes = download_pdf(pdf_url)
    if not pdf_bytes:
        return None

    text = extract_text_with_pdfparse(pdf_bytes)
    if text:
        print(f"[pdf] pdf-parse 成功: {len(text)} 字符")
    else:
        print("[pdf] pdf-parse 失败，尝试 OCR...")
        text = extract_text_with_ocr(pdf_bytes)
        if text:
            print(f"[pdf] OCR 成功: {len(text)} 字符")

    if not text:
        print("[pdf] 所有解析方式均失败")
        return None

    structured = extract_structured_with_llm(text)
    if structured:
        print(f"[llm] 结构化结果: {json.dumps(structured, ensure_ascii=False)}")
        return structured
    return None
