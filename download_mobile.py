#!/usr/bin/env python3
"""
네이버 카페 모바일 버전에서 엑셀 파일 다운로드 시도
"""
import requests
import re

def try_mobile_version():
    # 모바일 버전 URL
    url = "https://m.cafe.naver.com/realfarm/844033"
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    })
    
    try:
        response = session.get(url)
        response.raise_for_status()
        html = response.text
        
        print(f"모바일 버전 HTML 길이: {len(html)} bytes\n")
        
        # 엑셀 파일 링크 찾기
        excel_links = re.findall(r'https?://[^\s"<>]*\.(xlsx|xls)', html, re.IGNORECASE)
        if excel_links:
            print(f"엑셀 파일 링크 발견: {excel_links}")
        else:
            print("엑셀 파일 링크를 찾지 못했습니다.")
        
        # 첨부파일 관련 정보 찾기
        attach_info = re.findall(r'[^<>]*\.(xlsx|xls)[^<>]*', html, re.IGNORECASE)
        if attach_info:
            print(f"\n첨부파일 정보: {attach_info[:5]}")
        
        # 게시글 제목과 내용 찾기
        title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
        if title_match:
            print(f"\n제목: {title_match.group(1)}")
        
        # 시세표 관련 내용 찾기
        price_info = re.findall(r'.{0,300}시세.{0,300}', html, re.IGNORECASE)
        if price_info:
            print(f"\n시세 관련 내용 ({len(price_info)}개):")
            for i, info in enumerate(price_info[:3], 1):
                clean = re.sub(r'<[^>]+>', ' ', info)
                clean = re.sub(r'\s+', ' ', clean)
                print(f"  {i}. {clean[:200]}...")
        
        return html
        
    except Exception as e:
        print(f"에러: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    try_mobile_version()

