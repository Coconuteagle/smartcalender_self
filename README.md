# 스마트 캘린더 (정적 페이지)

## 로컬 실행

**권장 Node.js:** 20 LTS 이상

1. 설치: `npm install`
2. 실행: `npm run dev`
3. 접속: 콘솔에 표시된 주소로 접속 (예: `http://127.0.0.1:5174/`)

## Gemini API Key 입력

- 로그인/파이어베이스 없이 동작합니다.
- 화면 상단 `API Key 설정`에서 각 사용자가 본인 키를 입력합니다.
- 키는 브라우저 `localStorage`에만 저장됩니다.

## GitHub Pages 자동 배포

- `main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 후 `gh-pages` 브랜치에 배포합니다.
- GitHub 리포 설정: `Settings → Pages → Deploy from a branch → gh-pages / (root)`
