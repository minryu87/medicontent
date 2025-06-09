# MediContent AI 백엔드 (Flask)

## 실행 방법

1. 의존성 설치
```
pip install -r requirements.txt
```

2. 환경변수 설정
```
cp .env.example .env
# .env 파일에 DB, JWT, Gemini API 키 등 입력
```

3. DB 초기화 (예시)
```
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"
```

4. 서버 실행
```
python app/main.py
```

## 주요 API
- /api/user/register, /login, /me
- /api/content/
- /api/ai/generate-text
- /api/dashboard/summary
