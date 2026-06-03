# So do cay project va chu thich file

Ghi chu: `node_modules/`, `.git/`, `dist/`, `.venv/`, cache Python va cac file sinh tu dong khong duoc liet ke chi tiet vi khong phai ma nguon can sua. Thu muc `emotion/emotion/data/frames/...` co nhieu anh frame cung mot vai tro nen duoc gom theo dai ten file.

```text
Final/
|-- .gitignore                         # Quy tac bo qua file/thu muc khi commit Git.
|-- .gitmodules                        # Cau hinh submodule Git, hien dang rong.
|-- package.json                       # Script goc chay backend va frontend bang concurrently.
|-- package-lock.json                  # Khoa phien ban dependency Node o cap project goc.
|-- README.md                          # Mo ta tong quan cach chay va ket noi frontend/backend.
|-- start_all.bat                      # Script Windows mo backend FastAPI va frontend Vite.
|-- PROJECT_TREE.md                    # Tai lieu so do cay project va chu thich file.
|-- .vscode/
|   `-- settings.json                  # Cau hinh VS Code cho workspace goc.
|
|-- emotion/
|   |-- .vscode/
|   |   `-- settings.json              # Cau hinh VS Code rieng cho backend.
|   |
|   `-- emotion/
|       |-- .env                       # Bien moi truong/backend local.
|       |-- .gitignore                 # Quy tac bo qua file trong backend.
|       |-- README.md                  # Huong dan rieng cho backend emotion.
|       |-- requirements.txt           # Dependency Python cho backend AI/FastAPI.
|       |-- main.py                    # CLI/menu chay cac mode thu nghiem va server.
|       |-- fastapi_server.py          # Ban FastAPI server doc lap/cu, gom REST API va WebSocket.
|       |
|       |-- app/
|       |   |-- __init__.py            # Danh dau `app` la Python package.
|       |   |-- config.py              # Settings backend: host, port, database, CORS, camera, websocket.
|       |   |-- main.py                # Entrypoint chinh hien tai: import `app` va `run_server` tu runtime.
|       |   |-- runtime.py             # Backend runtime dang dung: REST API, WebSocket, xu ly frame, SQLite, report.
|       |   |
|       |   |-- api/
|       |   |   |-- __init__.py        # Khai bao API router theo kien truc module.
|       |   |   |-- health.py          # Endpoint health check theo router rieng.
|       |   |   |-- reports.py         # Endpoint bao cao va export report theo session.
|       |   |   |-- router.py          # Gom router health, sessions, reports.
|       |   |   `-- sessions.py        # Endpoint quan ly session va helper tao/end session.
|       |   |
|       |   |-- database/
|       |   |   |-- __init__.py        # Danh dau package database.
|       |   |   |-- base.py            # Tao SQLAlchemy engine, Base, session DB.
|       |   |   `-- session.py         # Cau hinh DB/session tuong tu base.py.
|       |   |
|       |   |-- models/
|       |   |   |-- __init__.py        # Export/nhom cac model.
|       |   |   |-- alert_model.py     # Model alert: loai canh bao, muc do, payload va rule.
|       |   |   |-- frame_result_model.py # Model ket qua mot frame: emotion, blink, head pose, landmark, bbox.
|       |   |   |-- report_model.py    # Model bao cao session: timeline, blink, stress, emotion, alert summary.
|       |   |   `-- session_model.py   # Model session: status, config, request/response, summary.
|       |   |
|       |   |-- schemas/
|       |   |   |-- __init__.py        # Danh dau package schema.
|       |   |   |-- feature_schema.py   # Schema feature/frame gui qua API/WebSocket.
|       |   |   |-- report_schema.py    # Schema report phien va cac chi so tong hop.
|       |   |   `-- session_schema.py   # Schema cau hinh, trang thai va thong tin session.
|       |   |
|       |   |-- services/
|       |   |   |-- __init__.py        # Danh dau package services.
|       |   |   |-- frame_service.py    # Tinh EAR, MAR, brow distance, stress score va blink.
|       |   |   |-- report_service.py   # Tao report tong hop tu du lieu session/frame.
|       |   |   `-- session_service.py  # Logic tao, cap nhat, ket thuc va lay session.
|       |   |
|       |   `-- websocket/
|       |       |-- __init__.py         # WebSocket endpoint theo kien truc handler/manager.
|       |       |-- ws_handler.py       # Xu ly vong doi WebSocket: start/stop/pause/resume, video_frame.
|       |       |-- ws_manager.py       # Quan ly ket noi WebSocket theo session_id va gui JSON.
|       |       `-- ws_processor.py     # FrameProcessor placeholder xu ly frame thanh FrameResult.
|       |
|       |-- src/
|       |   |-- camera.py             # Wrapper OpenCV VideoCapture: mo camera, resolution/fps, doc frame.
|       |   |-- data_collector.py     # Thu thap frame/video/landmark phuc vu train/test/offline.
|       |   |-- deepface_emotion.py   # Boc DeepFace de nhan dien cam xuc, co cache/analyze theo chu ky.
|       |   |-- face_detector.py      # Detect mat bang MediaPipe/OpenCV va crop ROI khuon mat.
|       |   |-- landmark_extractor.py # Trich xuat FaceMesh landmarks va chuyen sang toa do pixel.
|       |   |-- landmark_storage.py   # Luu/doc landmark ra file phuc vu inspect/offline.
|       |   |-- preprocessor.py       # Tien xu ly anh: doi mau, resize, normalize khi can.
|       |   |-- sqlite_storage.py     # Tao schema, tao/end session, insert frame metrics vao SQLite.
|       |   `-- test.py               # FaceAnalyzer tinh EAR/MAR/brow/cheek, blink, stress va trang thai.
|       |
|       |-- sql/
|       |   `-- schema.sql            # Schema SQLite: Session, Frame_metrics, Event va index query.
|       |
|       `-- data/
|           |-- face_emotion.db        # Database SQLite luu session va metrics da ghi.
|           |-- videos/
|           |   |-- text.txt           # Placeholder/ghi chu trong thu muc video.
|           |   `-- session_20260417_171947.mp4 # Video session da thu.
|           |-- landmarks/
|           |   `-- text.txt           # Placeholder/ghi chu trong thu muc landmark.
|           `-- frames/
|               |-- text.txt           # Placeholder/ghi chu trong thu muc frame.
|               `-- session_20260417_171947/
|                   `-- frame_00000.jpg ... frame_00135.jpg # Anh frame trich tu session video.
|
`-- frontend-AI/
    |-- .env                           # Bien moi truong frontend local.
    |-- .env.example                   # Mau bien moi truong frontend.
    |-- .gitignore                     # Quy tac bo qua file trong frontend.
    |-- package.json                   # Dependency va script frontend: dev, build, preview.
    |-- package-lock.json              # Khoa phien ban dependency frontend.
    |-- index.html                     # HTML root de Vite mount React app.
    |-- vite.config.ts                 # Cau hinh Vite va alias import.
    |-- tsconfig.json                  # Cau hinh TypeScript cho frontend.
    |-- tsconfig.node.json             # Cau hinh TypeScript cho file Node/Vite config.
    |-- tailwind.config.js             # Cau hinh Tailwind CSS.
    |-- postcss.config.js              # Cau hinh PostCSS/Tailwind/autoprefixer.
    |-- Dockerfile                     # Build image frontend.
    |-- nginx.conf                     # Cau hinh Nginx de serve frontend build.
    |-- requirements.txt               # File dependency Python neu co tool phu trong frontend.
    |-- setting.json                   # Cau hinh rieng cua frontend/project.
    |-- all_code2.txt                  # File gom code/log tham khao, khong phai source runtime chinh.
    |
    `-- src/
        |-- main.tsx                   # Entrypoint React: render App vao DOM.
        |-- App.tsx                    # Khai bao route: dashboard, report, history, not found.
        |-- index.css                  # CSS global va Tailwind base/components/utilities.
        |-- vite-env.d.ts              # Type cho bien moi truong Vite.
        |
        |-- api/
        |   |-- axiosClient.ts         # Axios instance dung chung, base URL va interceptor.
        |   |-- reportApi.ts           # Goi API lay/export report cua session da luu.
        |   `-- sessionApi.ts          # Goi API danh sach, chi tiet, xoa session.
        |
        |-- components/
        |   |-- common/
        |   |   |-- AlertBanner.tsx    # Banner hien thi alert realtime tu backend.
        |   |   |-- Button.tsx         # Button dung chung.
        |   |   |-- Card.tsx           # Card/panel dung chung.
        |   |   |-- ProgressBar.tsx    # Thanh tien do cho emotion/stress.
        |   |   `-- Siderbar.tsx       # Sidebar dieu huong Dashboard, Report, History.
        |   |
        |   `-- layout/
        |       |-- Footer.tsx         # Footer layout.
        |       |-- Header.tsx         # Header layout va trang thai ket noi.
        |       `-- MainLayout.tsx     # Layout chinh boc sidebar, header, footer va Outlet.
        |
        |-- hooks/
        |   `-- useSession.ts          # Hook noi WebSocket voi store: start/stop, frame_result, alert.
        |
        |-- pages/
        |   |-- DashboardPage.tsx      # Man hinh chinh: camera, WebSocket, emotion, stress, EAR, blink, alert.
        |   |-- HistoryPage.tsx        # Danh sach session tu backend va xoa session.
        |   |-- ReportPage.tsx         # Bao cao realtime hoac bao cao da luu tu backend theo sessionId.
        |   `-- NotFoundPage.tsx       # Trang 404.
        |
        |-- services/
        |   `-- websocketService.ts    # Singleton WebSocket: connect, reconnect, send command/frame.
        |
        |-- store/
        |   |-- useAlertStore.ts       # Zustand store alert trong phien hien tai.
        |   |-- useEmotionStore.ts     # Zustand store emotion hien tai va history realtime.
        |   |-- useFeatureStore.ts     # Zustand store feature/frame hien tai va history realtime.
        |   `-- useSessionStore.ts     # Zustand store session hien tai, elapsed, stats.
        |
        |-- types/
        |   |-- alert.types.ts         # Type alert khop voi payload backend.
        |   |-- api.types.ts           # Type response API va pagination.
        |   |-- emotion.types.ts       # Type nhan/cau truc emotion.
        |   |-- feature.types.ts       # Type feature khuon mat: bbox, landmark, blink, tension.
        |   |-- report.types.ts        # Type report va timeline.
        |   |-- session.types.ts       # Type session, summary, config mac dinh.
        |   `-- websocket.types.ts     # Type message WebSocket inbound/outbound.
        |
        `-- utils/
            |-- constants.ts           # URL backend/WS, nguong, label va cau hinh export.
            |-- emotionHelpers.ts      # Helper label/icon/mau sac emotion.
            |-- exportUtils.ts         # Export report PDF/CSV bang jsPDF/file-saver.
            |-- formatters.ts          # Format ngay gio, duration, so lieu.
            `-- statisticsUtils.ts     # Tinh thong ke emotion/stress/blink tu history.
```
