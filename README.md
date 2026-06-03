# AI Face Emotion Monitor

He thong theo doi bieu cam va dac trung khuon mat theo thoi gian thuc.
Backend dung FastAPI, OpenCV, MediaPipe, DeepFace va SQLite. Frontend dung
React, Vite, TypeScript, Zustand va Tailwind CSS.

## Cau Truc Chinh

```text
.
├── emotion/emotion/
│   ├── app/
│   │   ├── main.py          # FastAPI entrypoint chinh
│   │   └── runtime.py       # API + WebSocket + xu ly AI that
│   ├── src/                 # Camera, detector, landmark, DeepFace, SQLite
│   ├── sql/schema.sql       # Schema SQLite
│   └── main.py              # Menu chay cac mode thu nghiem
├── frontend-AI/
│   └── src/                 # React app
├── package.json             # Script chay ca backend va frontend
└── start_all.bat            # Script Windows
```

## Ket Noi Frontend - Backend

- REST API: `http://localhost:8000/api`
- WebSocket: `ws://localhost:8000/ws`
- Frontend gui frame webcam bang message `video_frame`.
- Backend tra ve `session_started`, `frame_result`, `alert`, `session_ended`.

## Chay Du An

```bash
npm run dev
```

Hoac chay bang Windows script:

```bat
start_all.bat
```

Backend entrypoint hien tai:

```bash
cd emotion/emotion
python -m app.main
```

Frontend:

```bash
cd frontend-AI
npm run dev
```

## Luu Y

- Can Python 3.10/3.11 va Node.js 18+.
- Neu `.venv` bi hong duong dan Python, tao lai moi truong ao:

```bash
cd emotion/emotion
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

- Lan dau dung DeepFace co the can tai model weights.
