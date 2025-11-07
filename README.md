# 레알팜 게임 핼퍼

레알팜 모바일 게임의 두레 가공품 계산 도우미 앱입니다. GitHub Pages에서 동작하는 정적 Vue.js 애플리케이션입니다.

## 기능

- 두레 가공품 이름과 개수를 입력하면 필요한 작물과 중간 가공품을 자동으로 계산
- 체인 형식 의존성 자동 해결 (A → B → C 구조)
- 건물별 가공품 그룹화 표시
- 의존성 체인 시각화

## 로컬 개발

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run serve
```

3. 빌드:
```bash
npm run build
```

## GitHub Pages 배포

이 프로젝트는 `hawksung1.github.io` 레포지토리에 배포됩니다.

### 자동 배포 (권장)

GitHub Actions가 자동으로 배포합니다:
- `main` 브랜치에 푸시하면 자동으로 빌드 및 배포됩니다.
- GitHub Pages 설정에서 소스를 `gh-pages` 브랜치로 설정하세요.

### 수동 배포

```bash
npm run deploy
```

## 프로젝트 구조

```
src/
├── components/          # Vue 컴포넌트
│   ├── SearchForm.vue   # 검색 입력 폼
│   ├── ResultDisplay.vue # 결과 표시
│   └── RecipeChain.vue  # 의존성 체인 시각화
├── data/                # 데이터 파일
│   ├── products.json    # 가공품 데이터
│   └── buildings.json   # 건물 데이터
├── utils/               # 유틸리티 함수
│   ├── calculator.js    # 계산 로직
│   └── chainResolver.js # 체인 의존성 해결
├── App.vue              # 메인 앱 컴포넌트
└── main.js              # 엔트리 포인트
```

## 데이터 추가

`src/data/products.json` 파일에 가공품 정보를 추가하면 됩니다:

```json
{
  "id": "product_id",
  "name": "가공품 이름",
  "building": "건물 이름",
  "ingredients": [
    { "type": "crop", "name": "작물명", "count": 10 },
    { "type": "product", "name": "다른 가공품", "count": 1 }
  ]
}
```

## 라이선스

MIT License
