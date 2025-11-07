#!/usr/bin/env python3
"""
네이버 카페 게시글에서 엑셀 파일 다운로드
"""
import requests
import re
import os
from urllib.parse import urljoin, urlparse

def download_excel_from_cafe(cafe_url):
    """네이버 카페 게시글에서 엑셀 파일 다운로드"""
    
    # 게시글 URL
    url = "https://cafe.naver.com/realfarm/844033"
    
    print(f"게시글 접속: {url}")
    
    # 세션 생성
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    try:
        # 게시글 페이지 가져오기
        response = session.get(url)
        response.raise_for_status()
        
        print(f"응답 상태: {response.status_code}")
        print(f"응답 길이: {len(response.text)} bytes")
        
        # 엑셀 파일 링크 찾기
        # 네이버 카페는 첨부파일을 다운로드하려면 로그인이 필요할 수 있음
        # 엑셀 파일 링크 패턴 찾기
        excel_patterns = [
            r'href="([^"]*\.xlsx[^"]*)"',
            r'href="([^"]*\.xls[^"]*)"',
            r'data-url="([^"]*\.xlsx[^"]*)"',
            r'data-url="([^"]*\.xls[^"]*)"',
            r'/attach/[^"]*\.xlsx',
            r'/attach/[^"]*\.xls',
        ]
        
        found_links = []
        for pattern in excel_patterns:
            matches = re.findall(pattern, response.text, re.IGNORECASE)
            found_links.extend(matches)
        
        print(f"찾은 엑셀 링크: {found_links[:5]}")
        
        # HTML 내용 일부 출력
        if 'xlsx' in response.text.lower() or 'xls' in response.text.lower():
            print("엑셀 파일 관련 내용 발견")
            # 엑셀 파일 관련 부분 추출
            excel_section = re.search(r'.{0,500}(xlsx|xls).{0,500}', response.text, re.IGNORECASE)
            if excel_section:
                print(f"관련 내용: {excel_section.group()[:200]}...")
        
        return response.text
        
    except Exception as e:
        print(f"에러 발생: {e}")
        return None

if __name__ == "__main__":
    result = download_excel_from_cafe("https://cafe.naver.com/realfarm/844033")
    if result:
        print("\n게시글 내용 일부:")
        # 제목 찾기
        title_match = re.search(r'<title[^>]*>([^<]+)</title>', result, re.IGNORECASE)
        if title_match:
            print(f"제목: {title_match.group(1)}")

