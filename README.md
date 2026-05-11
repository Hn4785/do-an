# 🎓 Hệ Thống Theo Dõi Biểu Cảm và Đặc Trưng Khuôn Mặt Người Học (AI Face Emotion Monitor)

Hệ thống ứng dụng trí tuệ nhân tạo (AI) để trích chọn đặc trưng khuôn mặt và phân tích biểu cảm của người học theo thời gian thực. Dự án kết hợp công nghệ Computer Vision để hỗ trợ đánh giá trạng thái tâm lý và mức độ tập trung trong môi trường giáo dục trực tuyến.

---

## 🌟 Tính Năng Chính (Key Features)

- **📸 Theo dõi thời gian thực (Real-time Tracking):** Nhận diện và phân tích dữ liệu trực tiếp từ Webcam với độ trễ thấp.
- **🎭 Phân tích biểu cảm (Emotion Analysis):** Nhận diện 7 trạng thái cảm xúc cơ bản thông qua DeepFace:

| Icon | Cảm xúc (English) | Ý nghĩa (Tiếng Việt) |
| :---: | :--- | :--- |
| 😊 | **Happy** | Vui vẻ, hào hứng |
| 😐 | **Neutral** | Bình thường, tập trung |
| 😢 | **Sad** | Buồn bã, thất vọng |
| 😠 | **Angry** | Tức giận, khó chịu |
| 😨 | **Fear** | Sợ hãi, lo lắng |
| 😲 | **Surprise** | Ngạc nhiên |
| 🤢 | **Disgust** | Ghê tởm, không hài lòng |

- **🧬 Trích xuất 468 điểm Landmark:** Sử dụng MediaPipe FaceMesh để xác định chi tiết cấu trúc hình học khuôn mặt.
- **📊 Chỉ số đặc trưng chuyên sâu:**
  - **Tỷ lệ mở mắt (EAR - Eye Aspect Ratio):** Tự động tính toán để phát hiện nháy mắt, nháy một mắt, và cảnh báo ngủ gật (Drowsiness Detection).
  - **Tỷ lệ mở miệng (MAR - Mouth Aspect Ratio):** Nhận diện hành vi ngáp (Yawning) hoặc nói chuyện.
  - **Góc quay đầu (Head Pose Yaw):** Theo dõi hướng nhìn (Nhìn thẳng, Quay trái, Quay phải) để đánh giá mức độ tập trung.
  - **Đặc trưng hình học khác:** Nhận diện nhíu mày (Frown), phồng má (Cheek Puff), nhếch mép (Smirk).
- **🧠 Đánh giá mức độ căng thẳng (Stress Level):** Thuật toán tự phát triển dựa trên tần suất nháy mắt (Blink Rate) và các biến động biểu cảm cơ học.
- **⏱️ Hiệu chuẩn tự động (Auto Calibration):** Hệ thống tự động hiệu chuẩn trong 3 giây đầu tiên để thích ứng với đặc điểm khuôn mặt riêng biệt của mỗi người dùng.
- **💾 Lưu trữ & Lịch sử:** Tự động lưu dữ liệu phiên học vào cơ sở dữ liệu SQLite và hiển thị biểu đồ thống kê theo thời gian.
- **📈 Dashboard trực quan:** Giao diện người dùng hiện đại với biểu đồ (Chart.js/Recharts) giúp theo dõi biến thiên cảm xúc.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### **Backend (Phòng thí nghiệm AI)**
- **Ngôn ngữ:** Python 3.10+
- **Các thư viện AI/ML chính:** 
  - **OpenCV (`opencv-python`):** Xử lý hình ảnh và luồng video trực tiếp.
  - **MediaPipe:** Trích xuất 468 điểm đặc trưng khuôn mặt (Face Mesh).
  - **DeepFace:** Nhận diện cảm xúc (hỗ trợ nhiều model như VGG-Face, Facenet, Emotion).
  - **TensorFlow:** Framework nền tảng cho các model Deep Learning.
- **Web Server & API:** 
  - **FastAPI:** Xử lý các yêu cầu API và luồng dữ liệu WebSocket.
  - **Uvicorn:** ASGI server để khởi chạy FastAPI.
- **Cơ sở dữ liệu:** 
  - **SQLAlchemy:** ORM quản lý truy vấn cơ sở dữ liệu.
  - **SQLite:** Lưu trữ dữ liệu lịch sử phiên học.
- **Khác:** `pydantic` (Validate dữ liệu), `python-dotenv` (Quản lý biến môi trường).

### **Frontend (Giao diện người dùng)**
- **Framework:** React.js (Vite)
- **Ngôn ngữ:** TypeScript
- **Các thư viện chính:**
  - **Phân tích dữ liệu & Biểu đồ:** `recharts`, `chart.js`, `react-chartjs-2`.
  - **Quản lý trạng thái:** `zustand`.
  - **Điều hướng:** `react-router-dom`.
  - **Xử lý HTTP & API:** `axios`.
  - **Tiện ích:** `lodash`, `dayjs`, `uuid`.
  - **Giao diện & Icons:** `lucide-react`, `tailwind-merge`, `clsx`.
  - **Xuất báo cáo:** `jspdf`, `jspdf-autotable`, `file-saver` (Hỗ trợ xuất lịch sử cảm xúc ra PDF/Excel).
- **Styling:** Tailwind CSS.

---

## 🏗️ Cấu Trúc Thư Mục (Project Structure)

```text
.
├── emotion/               # Source code Backend (Python)
│   └── emotion/
│       ├── app/           # Core logic (API, Models, Services, Websocket)
│       ├── data/          # Lưu trữ database & dữ liệu tạm
│       ├── fastapi_server.py # File chạy chính của Backend
│       ├── requirements.txt # Danh sách thư viện Python
│       └── .env           # Cấu hình môi trường Backend
├── frontend-AI/           # Source code Frontend (React)
│   ├── src/               # Components, Hooks, Pages, Types
│   ├── package.json       # Cấu hình dependencies Frontend
│   └── .env               # Cấu hình API URL & Websocket URL
├── start_all.bat          # Script khởi động nhanh cả 2 hệ thống (Windows)
└── package.json           # Cấu hình quản lý chung (root)
```

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

### **1. Yêu cầu hệ thống**
- **Python:** Phiên bản 3.10 hoặc 3.11 (Khuyến nghị 3.10.0 để đảm bảo tính ổn định của các thư viện AI).
- **Node.js:** Phiên bản 18.x trở lên.
- **Webcam:** Đang hoạt động bình thường.

### **2. Cài đặt Backend**
```bash
cd emotion/emotion
# Tạo môi trường ảo
python -m venv .venv
# Kích hoạt môi trường ảo (Windows)
.venv\Scripts\activate
# Cài đặt thư viện
pip install -r requirements.txt
```

### **3. Cài đặt Frontend**
```bash
cd frontend-AI
# Cài đặt thư viện (Standard)
npm install
```
*Lưu ý: Bạn có thể tham khảo danh sách thư viện tại file `frontend-AI/requirements.txt` nếu cần.*

---

## 🏃 Cách Khởi Chạy (Running)

### **Cách 1: Sử dụng Script tự động (Khuyến nghị)**
Tại thư mục gốc của dự án, chạy file:
```bash
start_all.bat
```
Script này sẽ tự động mở 2 cửa sổ terminal riêng biệt cho Backend và Frontend.

### **Cách 2: Chạy thủ công**
- **Backend:**
  ```bash
  cd emotion/emotion
  python fastapi_server.py
  ```
- **Frontend:**
  ```bash
  cd frontend-AI
  npm run dev
  ```

Mặc định:
- Frontend sẽ chạy tại: `http://localhost:3000`
- Backend API sẽ chạy tại: `http://localhost:8000`

---

## 📝 Lưu Ý Quan Trọng
- **Cấu hình API:** Kiểm tra file `.env` trong thư mục `frontend-AI` để đảm bảo `VITE_API_BASE_URL` và `VITE_WS_URL` trỏ đúng về địa chỉ của Backend.
- **DeepFace:** Trong lần chạy đầu tiên, hệ thống sẽ tự động tải các model trọng số (weights) của DeepFace (khoảng vài trăm MB), vui lòng đảm bảo kết nối internet ổn định.
- **Port:** Đảm bảo cổng 8000 (Backend) và 5173 (Frontend) không bị chiếm dụng bởi ứng dụng khác.

---


