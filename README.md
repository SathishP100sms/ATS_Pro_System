# 🧠 ATS Pro - AI-Powered Applicant Tracking System

## [LIVE DEMO](https://ats-pro-system.vercel.app)

## 📋 Overview

ATS Pro is an enterprise-grade Applicant Tracking System that evaluates resumes against job descriptions using semantic understanding and keyword matching.

### Why ATS Pro?

- 🎯 **Dual Scoring Algorithm** - 60% semantic similarity + 40% keyword matching
- 🧠 **AI-Powered** - Uses sentence transformers and spaCy for deep matching
- 📊 **Detailed Analytics** - Reports scores, missing keywords, and recommendations
- 🎨 **Modern UI** - Clean interface with light/dark theme support
- ⚡ **Fast & Accurate** - Process resumes quickly with reliable scoring
- 🔒 **Secure** - Temporary file handling with no persistence after evaluation

---

## 🏗️ Project Structure

```
ATS_Pro_System/
│
├── backend/
│   ├── app.py
│   ├── embedding_model.py
│   ├── keyword_extraction.py
│   ├── main.py
│   ├── multi_document_loader.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── __init__.py
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── scripts.js
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── LICENSE
├── README.md
└── .gitignore
```

---

## 🚀 Production Deployment Architecture
ATS Pro is deployed using a modern MLOps-inspired CI/CD pipeline.

### Deployment Stack

#### Frontend

- Vercel
- HTML5
- CSS3
- JavaScript

#### Backend

- FastAPI
- Sentence Transformers
- spaCy
- Docker

#### Cloud Infrastructure

- AWS EC2
- AWS ECR
- GitHub Actions
- GitHub Self-Hosted Runner

---

## CI/CD Pipeline

```
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
(Self-Hosted Runner on EC2)
    │
    ▼
Docker Build
    │
    ▼
Amazon ECR
    │
    ▼
Pull Latest Image
    │
    ▼
Restart FastAPI Container
    │
    ▼
Production Deployment
```

### Continuous Deployment Workflow
Every push to the `main` branch automatically:

1. Builds a new Docker image.
2. Pushes the image to Amazon ECR.
3. Pulls the latest image on EC2.
4. Stops the running ATS container.
5. Deploys the updated version.
6. Makes the new API available instantly.

No manual deployment steps are required.

---

## ✨ Features

### Backend Capabilities
- **Multi-Format Support** - PDF, DOCX, TXT file parsing
- **Semantic Analysis** - Advanced NLP using `sentence-transformers`
- **Keyword Extraction** - spaCy-based intelligent keyword mining
- **Cosine Similarity** - Precise semantic matching algorithm
- **RESTful API** - FastAPI with automatic OpenAPI documentation
- **Error Handling** - Comprehensive validation and error messages

### Frontend Features
- **Drag & Drop Upload** - Intuitive file upload interface
- **Real-time Validation** - File size and format checks
- **Dark/Light Theme** - Toggle between professional color schemes
- **Animated Results** - Smooth score animations and progress bars
- **Export Functionality** - Download analysis results as JSON
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Keyboard Shortcuts** - Power user features for efficiency

### Scoring Methodology
```
Final Score = (Semantic Score × 0.6) + (Keyword Score × 0.4)

Semantic Score: Measures contextual alignment using embeddings
Keyword Score: Measures specific skill requirement matches
```

---

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- Docker (for containerized local testing)
- Node.js (optional, for frontend development)
- 10MB free disk space

### Backend Setup (Local Python)

1. **Clone the repository**
```bash
git clone https://github.com/SathishP100sms/ATS_Pro_System.git
cd ATS_Pro_System
```

2. **Create and activate a virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Run the backend server**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Backend Setup (Docker)

1. **Build the Docker image**
```bash
cd backend
docker build -t ats_system:V1.0 .
```

2. **Run the container locally**
```bash
docker run --rm -p 8000:8000 ats_system:V1.0
```

3. **Open the API**
- `http://localhost:8000`
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to the frontend directory**
```bash
cd frontend
```

2. **Open directly**
- Open `frontend/index.html` in your browser

3. **Or use a local development server**
```bash
# Using Python
python -m http.server 3000

# OR using Node.js
npx http-server -p 3000
```

4. **Open the frontend**
- `http://localhost:3000`

---

## 💻 Usage

### Web Interface

1. **Start the backend server**
```bash
cd backend
uvicorn app:app --reload
```

2. **Open the frontend**
   - Navigate to `http://localhost:3000` (if using local server)
   - Or open `frontend/index.html` directly in browser

3. **Upload Resume**
   - Click upload area or drag & drop your resume
   - Supported formats: PDF, DOCX, TXT (max 10MB)

4. **Enter Job Description**
   - Paste the complete job description
   - Include requirements, skills, and qualifications

5. **Analyze**
   - Click "Analyze Resume" button
   - Wait for AI processing (typically 3-5 seconds)

6. **Review Results**
   - Overall match score (0-100)
   - Semantic similarity score
   - Keyword match score
   - Missing keywords list
   - Hiring recommendations

### API Usage

```python
import requests

files = {
    'resume_file': open('resume.pdf', 'rb')
}

data = {
    'jd_text': 'Looking for Python developer with 3+ years experience...'
}

response = requests.post(
    'http://localhost:8000/evaluate/',
    files=files,
    data=data
)

result = response.json()
print(f"Final Score: {result['final_score']}%")
print(f"Missing Keywords: {result['missing_keywords']}")
```

---

## 📚 API Documentation

### Endpoints

#### `GET /`
Health check endpoint
```bash
curl http://localhost:8000/
```

Response:
```json
{
  "message": "ATS System is running",
  "version": "1.0.0",
  "status": "healthy"
}
```

#### `GET /health/`
Detailed health check
```bash
curl http://localhost:8000/health/
```

Response:
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2",
  "supported_files": [".pdf", ".txt", ".docx"],
  "max_file_size_MB": 10.0
}
```

#### `POST /evaluate/`
Evaluate resume against job description

**Parameters:**
- `resume_file` (file): Resume file (PDF, DOCX, or TXT)
- `jd_text` (string): Job description text

**Request:**
```bash
curl -X POST http://localhost:8000/evaluate/ \
  -F "resume_file=@resume.pdf" \
  -F "jd_text=Looking for Python developer..."
```

**Response:**
```json
{
  "semantic_score": 85.34,
  "keyword_score": 72.5,
  "missing_keywords": ["docker", "kubernetes", "AWS"],
  "total_missing_keywords": 3,
  "final_score": 80.02
}
```

---

## 🚀 Deployment & CI/CD

### GitHub Actions + Self-hosted Runner

This project includes a deployment workflow at `.github/workflows/deploy.yml` that runs on a **self-hosted GitHub Actions runner**.

The workflow performs these tasks:
- checks out the repository
- configures AWS credentials from repository secrets
- logs in to Amazon ECR
- builds the Docker image from `backend/`
- tags and pushes the image to ECR
- pulls the pushed image back on the runner host
- stops and removes the existing container
- starts a fresh container on port `8000`

### Required GitHub Secrets

Add these secrets to your repository settings:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ECR_LOGIN_URI`
- `ECR_REPOSITORY_NAME`

### Workflow Notes

- `runs-on: self-hosted` means the job executes on your own runner machine.
- The self-hosted runner must have Docker installed and allow container execution.
- Port `8000` must be open on the runner host.

### AWS Deployment Flow

1. Push code to `main`
2. GitHub Actions triggers `.github/workflows/deploy.yml`
3. Docker image is built locally on the self-hosted runner
4. Image is pushed to Amazon ECR
5. Runner pulls the image and runs the container

---

## 📝 Notes

- The frontend is built with plain HTML/CSS/JS and does not require a frontend build pipeline.
- The backend can be deployed via Docker and hosted on any container-ready environment.
- GitHub Actions deploys the backend automatically to a self-hosted runner configured with AWS credentials.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the terms of the MIT License. See `LICENSE` for details.
