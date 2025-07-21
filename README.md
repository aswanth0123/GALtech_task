🖼️ AI Image Analyzer & Generator
A web app to analyze uploaded images using AI and optionally generate new images based on that analysis.

📦 Project Overview
Frontend: React + TypeScript
Backend: FastAPI + MongoDB
Main Features:

User authentication (register/login)

Upload and analyze images

Generate new images from analysis

View and download results

🚀 How to Run the Project
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/ai-image-analyzer.git
cd ai-image-analyzer
2. Backend Setup (FastAPI)
bash
Copy
Edit
cd backend
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows

pip install -r requirements.txt
cp .env.template .env          # Add your environment values

uvicorn app.main:app --reload
3. Frontend Setup (React + TypeScript)
bash
Copy
Edit
cd frontend
npm install
cp .env.template .env          # Add your API URL

npm run dev
