# MediContent AI (MVP)

병원 컨텐츠 마케팅 자동화 플랫폼

## 구조
- backend/ : Flask RESTful API 서버
- frontend/ : React SPA

## 실행 방법

### 1. 백엔드
```bash
cd backend
cp .env.example .env
# .env 파일에 DB, JWT, Gemini API 키 등 입력
pip install -r requirements.txt
python app/scripts/init_db.py  # DB 초기화 및 샘플 데이터
python app/main.py
```

### 2. 프론트엔드
```bash
cd frontend
npm install
npm start
```

## 주요 기능 (MVP)
- 회원가입/로그인/역할별 권한
- AI 텍스트/이미지 생성(Gemini)
- 컨텐츠 생성/저장/이미지 첨부/미디어 관리
- 승인 요청/처리(의료진/관리자)
- 캠페인 생성/배포/스케줄
- 대시보드/성과 분석

## 샘플 계정
- 관리자: admin@sample.com / admin1234
- 의료진: doctor@sample.com / doctor1234

## API 명세
- /api/user/register, /login, /me
- /api/content/ (생성/목록/상세)
- /api/ai/generate-text, /generate-image
- /api/media/upload, /list, /delete
- /api/approval/request, /pending, /action
- /api/campaign/ (생성/목록/상세/스케줄)
- /api/distribution/publish
- /api/dashboard/summary, /analytics/summary

---

실행/구성 문의: 개발팀
