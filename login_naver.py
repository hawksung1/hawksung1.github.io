#!/usr/bin/env python3
"""
네이버 로그인 및 카페 엑셀 파일 다운로드
"""
import requests
import re
from urllib.parse import urljoin, urlparse

def login_and_download():
    """네이버 로그인 시도"""
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    # 네이버 로그인 페이지
    login_url = "https://nid.naver.com/nidlogin.login"
    
    print("네이버 로그인 페이지 접속...")
    
    try:
        # 로그인 페이지 가져오기
        response = session.get(login_url)
        response.raise_for_status()
        
        # CSRF 토큰이나 필요한 값 찾기
        html = response.text
        
        # 로그인 폼 정보 추출
        print("로그인 폼 분석 중...")
        
        # 실제 로그인은 보안이 강화되어 있어서 직접 구현하기 어렵습니다
        # 대신 쿠키를 사용하거나, 사용자가 로그인한 세션을 사용해야 합니다
        
        print("\n네이버 로그인은 보안이 강화되어 있어서")
        print("프로그래밍 방식으로 직접 로그인하기 어렵습니다.")
        print("\n대안:")
        print("1. 브라우저에서 로그인 후 쿠키를 복사해서 사용")
        print("2. Playwright로 브라우저 자동화 (하지만 현재 작동 안 함)")
        print("3. 직접 파일 다운로드 후 제공")
        
        return None
        
    except Exception as e:
        print(f"에러: {e}")
        return None

def download_with_cookies(cookies_str):
    """쿠키를 사용해서 엑셀 파일 다운로드"""
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    # 쿠키 파싱
    # 쿠키 형식: "name=value; name2=value2" 또는 딕셔너리
    if isinstance(cookies_str, str):
        cookies = {}
        for item in cookies_str.split(';'):
            if '=' in item:
                key, value = item.strip().split('=', 1)
                cookies[key] = value
    else:
        cookies = cookies_str
    
    session.cookies.update(cookies)
    
    # 카페 게시글 접속
    url = "https://cafe.naver.com/realfarm/844033"
    
    try:
        response = session.get(url)
        response.raise_for_status()
        
        print(f"게시글 접속 성공: {response.status_code}")
        
        # 엑셀 파일 링크 찾기
        html = response.text
        
        # 첨부파일 링크 패턴 찾기
        excel_patterns = [
            r'href="([^"]*attach[^"]*\.xlsx[^"]*)"',
            r'href="([^"]*attach[^"]*\.xls[^"]*)"',
            r'data-url="([^"]*\.xlsx[^"]*)"',
            r'data-file-sn="(\d+)"[^>]*\.xlsx',
        ]
        
        for pattern in excel_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            if matches:
                print(f"엑셀 파일 링크 발견: {matches}")
                # 첫 번째 링크 다운로드
                file_url = matches[0]
                if not file_url.startswith('http'):
                    file_url = urljoin(url, file_url)
                
                print(f"다운로드 시도: {file_url}")
                file_response = session.get(file_url)
                file_response.raise_for_status()
                
                # 파일 저장
                filename = "2025년_5월_시세표.xlsx"
                with open(filename, 'wb') as f:
                    f.write(file_response.content)
                
                print(f"파일 다운로드 완료: {filename}")
                return filename
        
        print("엑셀 파일 링크를 찾지 못했습니다.")
        return None
        
    except Exception as e:
        print(f"에러: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("=" * 50)
    print("네이버 로그인 및 엑셀 파일 다운로드")
    print("=" * 50)
    
    # 로그인 시도
    login_and_download()
    
    print("\n" + "=" * 50)
    print("쿠키를 사용한 다운로드 방법:")
    print("1. 브라우저에서 네이버에 로그인")
    print("2. 개발자 도구(F12) -> Network 탭")
    print("3. 카페 게시글 접속")
    print("4. Request Headers에서 Cookie 값 복사")
    print("5. 아래 함수에 쿠키 전달")
    print("=" * 50)

