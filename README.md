# AI Face Emotion Monitor

AI Face Emotion Monitor là hệ thống theo dõi biểu cảm khuôn mặt, mức độ căng thẳng, chớp mắt và các đặc trưng khuôn mặt theo thời gian thực.

Dự án gồm 2 phần chính:

- **Backend**: FastAPI, OpenCV, MediaPipe, DeepFace, TensorFlow, SQLite.
- **Frontend**: React, Vite, TypeScript, Zustand, Tailwind CSS.

## 1. Yêu cầu trước khi cài đặt

Trước khi tải và chạy dự án, hãy cài các phần mềm sau:

### Git

Dùng để tải source code từ GitHub.

Tải tại:

```text
https://git-scm.com/downloads
```

Kiểm tra sau khi cài:

```powershell
git --version
```

### Node.js

Dùng để chạy frontend React.

Khuyến nghị dùng **Node.js 18 trở lên**.

Tải tại:

```text
https://nodejs.org/
```

Kiểm tra sau khi cài:

```powershell
node -v
npm -v
```

### Python

Dùng để chạy backend FastAPI và các thư viện AI.

Khuyến nghị dùng **Python 3.10 hoặc 3.11**.

Tải tại:

```text
https://www.python.org/downloads/
```

Khi cài Python trên Windows, nhớ chọn:

```text
Add Python to PATH
```

Kiểm tra sau khi cài:

```powershell
python --version
```

Hoặc:

```powershell
py --version
```

## 2. Tải source code từ GitHub

Mở PowerShell hoặc Terminal tại thư mục bạn muốn lưu dự án, sau đó chạy:

```powershell
git clone https://github.com/Hn4785/do-an.git
```

Đi vào thư mục dự án:

```powershell
cd do-an
```

Nếu bạn đã có sẵn source code trong máy, chỉ cần mở terminal tại thư mục dự án hiện tại, ví dụ:

```powershell
cd E:\N\Final
```

## 3. Cấu trúc thư mục chính

```text
.
├── emotion/
│   └── emotion/
│       ├── app/
│       │   ├── main.py
│       │   └── runtime.py
│       ├── data/
│       │   └── face_emotion.db
│       ├── sql/
│       ├── src/
│       └── requirements.txt
├── frontend-AI/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── package.json
├── start_all.bat
└── README.md
```

Trong đó:

- `emotion/emotion`: source code backend.
- `frontend-AI`: source code frontend.
- `package.json` ở thư mục gốc: chứa lệnh chạy cả backend và frontend cùng lúc.
- `start_all.bat`: file chạy nhanh trên Windows.

## 4. Cài đặt thư viện backend

Đi vào thư mục backend:

```powershell
cd emotion\emotion
```

Tạo môi trường ảo Python:

```powershell
python -m venv .venv
```

Nếu máy bạn dùng lệnh `py`, có thể chạy:

```powershell
py -3 -m venv .venv
```

Kích hoạt môi trường ảo:

```powershell
.\.venv\Scripts\activate
```

Sau khi kích hoạt thành công, terminal thường sẽ hiện `(.venv)` ở đầu dòng.

Cập nhật `pip`:

```powershell
python -m pip install --upgrade pip
```

Cài các thư viện Python:

```powershell
pip install -r requirements.txt
```

Các thư viện chính được cài gồm:

- `fastapi`
- `uvicorn`
- `opencv-python`
- `mediapipe`
- `tensorflow`
- `deepface`
- `numpy`
- `sqlalchemy`
- `python-dotenv`

Sau khi cài xong backend, quay lại thư mục gốc:

```powershell
cd ..\..
```

## 5. Cài đặt thư viện frontend

Đi vào thư mục frontend:

```powershell
cd frontend-AI
```

Cài thư viện Node.js:

```powershell
npm install
```

Các thư viện chính được cài gồm:

- `react`
- `vite`
- `typescript`
- `axios`
- `zustand`
- `chart.js`
- `recharts`
- `jspdf`
- `tailwindcss`
- `lucide-react`

Sau khi cài xong frontend, quay lại thư mục gốc:

```powershell
cd ..
```

## 6. Cài thư viện chạy đồng thời backend và frontend

Ở thư mục gốc của dự án, chạy:

```powershell
npm install
```

Lệnh này cài thư viện `concurrently`, dùng để chạy backend và frontend cùng lúc bằng một lệnh.

## 7. Cấu hình môi trường frontend

Trong thư mục `frontend-AI`, dự án có file mẫu:

```text
frontend-AI\.env.example
```

Tạo file `.env` từ file mẫu:

```powershell
copy frontend-AI\.env.example frontend-AI\.env
```

Nội dung mặc định:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=Face Emotion Monitor
VITE_APP_VERSION=1.0.0
```

Thông thường bạn không cần sửa file này nếu backend chạy ở cổng `8000`.

## 8. Cách chạy dự án

Bạn có 3 cách chạy.

### Cách 1: Chạy nhanh bằng file `.bat`

Ở thư mục gốc, chạy:

```powershell
.\start_all.bat
```

File này sẽ mở 2 cửa sổ terminal:

- Một cửa sổ chạy backend FastAPI.
- Một cửa sổ chạy frontend React.

Sau đó mở trình duyệt tại:

```text
http://localhost:3000
```

### Cách 2: Chạy cả backend và frontend bằng npm

Ở thư mục gốc, chạy:

```powershell
npm run dev
```

Lệnh này sẽ chạy đồng thời:

```powershell
npm run dev:backend
npm run dev:frontend
```

Frontend chạy tại:

```text
http://localhost:3000
```

Backend chạy tại:

```text
http://localhost:8000
```

Tài liệu API FastAPI:

```text
http://localhost:8000/docs
```

### Cách 3: Chạy thủ công từng phần

Mở terminal thứ nhất để chạy backend:

```powershell
cd emotion\emotion
.\.venv\Scripts\activate
python -m app.main
```

Nếu lệnh `python` không chạy, thử:

```powershell
py -3 -m app.main
```

Mở terminal thứ hai để chạy frontend:

```powershell
cd frontend-AI
npm run dev
```

Sau đó mở:

```text
http://localhost:3000
```

## 9. Kiểm tra hệ thống sau khi chạy

Sau khi chạy thành công:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- REST API chính: `http://localhost:8000/api`
- WebSocket: `ws://localhost:8000/ws`

Nếu dùng webcam, trình duyệt có thể hỏi quyền truy cập camera. Hãy chọn **Allow** hoặc **Cho phép**.

## 10. Build frontend

Nếu muốn build frontend để deploy:

```powershell
cd frontend-AI
npm run build
```

Kết quả build nằm trong:

```text
frontend-AI\dist
```

Có thể xem thử bản build bằng:

```powershell
npm run preview
```

## 11. Cập nhật code mới nhất từ GitHub

Nếu bạn đã clone dự án rồi và muốn lấy code mới nhất:

```powershell
git pull origin main
```

Nếu đang có code sửa dở, hãy kiểm tra trước:

```powershell
git status
```

## 12. Đẩy code lên GitHub

Kiểm tra file đã thay đổi:

```powershell
git status
```

Thêm toàn bộ thay đổi:

```powershell
git add .
```

Tạo commit:

```powershell
git commit -m "Update project code"
```

Đẩy lên GitHub:

```powershell
git push origin main
```

Nếu push bị lỗi vì GitHub có code mới hơn, chạy:

```powershell
git pull origin main --rebase
git push origin main
```

## 13. Lỗi thường gặp

### Lỗi `Port 8000 already in use`

Cổng backend `8000` đang bị chương trình khác dùng.

Cách xử lý đơn giản:

- Đóng các terminal backend cũ.
- Chạy lại dự án.

Hoặc tìm tiến trình đang dùng cổng `8000`:

```powershell
netstat -ano | findstr :8000
```

Sau đó tắt tiến trình theo PID:

```powershell
taskkill /PID <PID> /F
```

### Lỗi `Port 3000 already in use`

Cổng frontend `3000` đang bị dùng.

Cách xử lý:

- Đóng terminal frontend cũ.
- Chạy lại `npm run dev`.

Vite cũng có thể tự chuyển sang cổng khác, ví dụ `3001`. Khi đó hãy mở đúng URL mà terminal hiển thị.

### Lỗi không nhận lệnh `python`

Thử dùng:

```powershell
py --version
```

Nếu có kết quả, chạy backend bằng:

```powershell
py -3 -m app.main
```

Nếu cả `python` và `py` đều không chạy, hãy cài lại Python và bật tùy chọn `Add Python to PATH`.

### Lỗi không nhận lệnh `npm`

Kiểm tra Node.js:

```powershell
node -v
npm -v
```

Nếu không có kết quả, hãy cài lại Node.js.

### Lỗi khi cài TensorFlow, MediaPipe hoặc DeepFace

Các thư viện AI có thể kén phiên bản Python.

Khuyến nghị:

- Dùng Python 3.10 hoặc 3.11.
- Tạo lại môi trường ảo `.venv`.
- Chạy lại `pip install -r requirements.txt`.

Tạo lại môi trường ảo:

```powershell
cd emotion\emotion
Remove-Item -Recurse -Force .venv
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Lần đầu chạy DeepFace bị chậm

Lần đầu sử dụng, DeepFace có thể tải model weights về máy. Việc này có thể mất vài phút tùy tốc độ mạng.

## 14. Ghi chú cho Windows

Dự án này có sẵn file:

```text
start_all.bat
```

Đây là cách chạy tiện nhất trên Windows.

Nếu PowerShell không cho chạy lệnh kích hoạt môi trường ảo, chạy:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Sau đó chọn `Y`, rồi kích hoạt lại:

```powershell
.\.venv\Scripts\activate
```

## 15. Tóm tắt lệnh cài đặt nhanh

Nếu bạn mới tải dự án về, có thể chạy theo thứ tự sau:

```powershell
git clone https://github.com/Hn4785/do-an.git
cd do-an

cd emotion\emotion
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..\..

cd frontend-AI
npm install
cd ..

npm install
copy frontend-AI\.env.example frontend-AI\.env
npm run dev
```

Sau đó mở:

```text
http://localhost:3000
```
