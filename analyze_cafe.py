#!/usr/bin/env python3
"""
네이버 카페 게시글 내용 분석 및 엑셀 파일 찾기
"""
import requests
import re
import json

def analyze_cafe_post():
    url = "https://cafe.naver.com/realfarm/844033"
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    try:
        response = session.get(url)
        response.raise_for_status()
        html = response.text
        
        print(f"HTML 길이: {len(html)} bytes\n")
        
        # 엑셀 파일 관련 키워드 찾기
        keywords = ['xlsx', 'xls', '엑셀', '시세표', '첨부', '다운로드', 'attach']
        for keyword in keywords:
            matches = re.findall(rf'.{{0,200}}{re.escape(keyword)}.{{0,200}}', html, re.IGNORECASE)
            if matches:
                print(f"\n'{keyword}' 관련 내용 ({len(matches)}개):")
                for i, match in enumerate(matches[:3], 1):
                    # HTML 태그 제거
                    clean = re.sub(r'<[^>]+>', '', match)
                    print(f"  {i}. {clean[:150]}...")
        
        # 첨부파일 관련 패턴 찾기
        attach_patterns = [
            r'attach[^"]*\.(xlsx|xls)',
            r'file[^"]*\.(xlsx|xls)',
            r'download[^"]*\.(xlsx|xls)',
            r'\.xlsx',
            r'\.xls',
        ]
        
        print("\n\n첨부파일 링크 패턴 검색:")
        for pattern in attach_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            if matches:
                print(f"  {pattern}: {len(matches)}개 발견")
                for match in matches[:3]:
                    print(f"    - {match}")
        
        # 게시글 본문 추출 시도
        print("\n\n게시글 본문 추출 시도:")
        # ArticleContent, article_content 등의 클래스 찾기
        content_patterns = [
            r'<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)</div>',
            r'<div[^>]*id="[^"]*content[^"]*"[^>]*>(.*?)</div>',
            r'<article[^>]*>(.*?)</article>',
        ]
        
        for pattern in content_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
            if matches:
                print(f"본문 패턴 '{pattern[:50]}...' 발견: {len(matches)}개")
                for i, match in enumerate(matches[:1], 1):
                    clean = re.sub(r'<[^>]+>', ' ', match)
                    clean = re.sub(r'\s+', ' ', clean)
                    print(f"  본문 {i} (처음 500자): {clean[:500]}...")
        
        # 파일 저장
        with open('cafe_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"\n\nHTML 파일 저장: cafe_page.html")
        
    except Exception as e:
        print(f"에러: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze_cafe_post()

