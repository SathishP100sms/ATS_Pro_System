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
# ATS Backend Deployment — CI/CD Pipeline on AWS EC2 via ECR

A complete guide documenting the challenges faced and solutions applied during the deployment of the ATS Backend system using GitHub Actions, Docker, Amazon ECR, and AWS EC2.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Uvicorn (Python 3.11) |
| Containerization | Docker |
| Container Registry | Amazon ECR (Elastic Container Registry) |
| Hosting | AWS EC2 (Ubuntu, us-east-1) |
| CI/CD | GitHub Actions (Self-Hosted Runner) |
| ML Libraries | PyTorch (CPU), spaCy, sentence-transformers |

---

## Final Working Workflow File

```yaml
name: ATS Backend Deployment

on:
  push:
    branches:
      - main

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY_NAME }}
  ECR_REGISTRY: ${{ secrets.AWS_ECR_LOGIN_URI }}
  IMAGE_TAG: latest
  CONTAINER_NAME: ats-api

jobs:
  deploy:
    runs-on: self-hosted
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Set Lowercase Image URI
        id: image-uri
        run: |
          IMAGE_URI=$(echo "${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}" | tr '[:upper:]' '[:lower:]')
          echo "IMAGE_URI=$IMAGE_URI" >> $GITHUB_ENV

      - name: Build Docker Image
        run: docker build -t ${{ env.IMAGE_URI }} ./backend

      - name: Push Docker Image to ECR
        run: docker push ${{ env.IMAGE_URI }}

      - name: Pull Latest Image
        run: docker pull ${{ env.IMAGE_URI }}

      - name: Stop Existing Container
        run: |
          docker stop ${{ env.CONTAINER_NAME }} || true
          docker rm ${{ env.CONTAINER_NAME }} || true

      - name: Run New Container
        run: |
          docker run -d \
            --name ${{ env.CONTAINER_NAME }} \
            --restart unless-stopped \
            -p 8000:8000 \
            ${{ env.IMAGE_URI }}

      - name: Cleanup Unused Images
        run: docker image prune -af
```

---

## Required GitHub Secrets

Go to **GitHub Repo → Settings → Secrets and variables → Actions** and add:

| Secret Name | Description | Example |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | `wJalrXUtnFEMI/...` |
| `ECR_REPOSITORY_NAME` | ECR repo name (lowercase) | `ats-ecr` |
| `AWS_ECR_LOGIN_URI` | ECR registry URI | `123456789.dkr.ecr.us-east-1.amazonaws.com` |

---

## Challenges Faced & Solutions

---

### Challenge 1 — AWS Credentials Could Not Be Loaded

**Error:**
```
Credentials could not be loaded, please check your action inputs:
Could not load credentials from any providers
```

**Cause:**
GitHub Actions secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` were either not set, incorrectly named, or had extra whitespace when pasted.

**Solution:**
- Go to **GitHub → Settings → Secrets → Actions**
- Delete and re-add secrets carefully (no extra spaces)
- Secret names are **case-sensitive** — must match exactly
- Verify the IAM user's access key is **Active** in AWS Console

---

### Challenge 2 — Invalid Docker Image Reference (Uppercase)

**Error:**
```
invalid argument "***/***:latest" for "-t, --tag" flag:
invalid reference format: repository name (***) must be lowercase
```

**Cause:**
The `ECR_REPOSITORY_NAME` secret contained uppercase letters. Docker requires all image names to be lowercase.

**Solution:**
Added a dedicated step to convert the full image URI to lowercase before use:

```yaml
- name: Set Lowercase Image URI
  id: image-uri
  run: |
    IMAGE_URI=$(echo "${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}" | tr '[:upper:]' '[:lower:]')
    echo "IMAGE_URI=$IMAGE_URI" >> $GITHUB_ENV
```

All subsequent steps reference `${{ env.IMAGE_URI }}` instead of constructing the URI manually.

---

### Challenge 3 — Docker Permission Denied on Self-Hosted Runner

**Error:**
```
permission denied while trying to connect to the Docker daemon socket
at unix:///var/run/docker.sock
```

**Cause:**
The self-hosted runner user (`ubuntu`) was not in the `docker` group, so it couldn't execute Docker commands without `sudo`.

**Solution:**
SSH into EC2 and run:

```bash
# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Apply group change immediately
newgrp docker

# Verify docker works without sudo
docker ps
```

Then restart the runner:
```bash
cd ~/actions-runner
./run.sh
```

> **Note:** A logout/login or reboot is required for group changes to fully take effect.

---

### Challenge 4 — EC2 Disk Full (No Space Left on Device)

**Error:**
```
System.IO.IOException: No space left on device
```

**Cause:**
The EC2 instance had only 8GB storage. The Docker image (containing PyTorch ~192MB, spaCy, sentence-transformers, and other ML libraries) consumed all available disk space during the build.

**Disk usage at time of error:**
```
/dev/root    7.7G    6.0G    630M    91%    /
```

**Solution — Immediate cleanup:**
```bash
# Remove all unused Docker resources
docker system prune -af --volumes

# Clean runner diagnostic logs
rm -rf ~/actions-runner/_diag/*.log
rm -rf ~/actions-runner/_work/_temp/*

# Clean apt cache
sudo apt-get clean
sudo apt-get autoremove -y
```

**Solution — Permanent fix (increase EBS volume):**
1. Go to **AWS Console → EC2 → Volumes**
2. Select volume → **Actions → Modify Volume** → increase to **20GB**
3. Apply the resize on EC2:

```bash
# Extend the partition
sudo growpart /dev/nvme0n1 1

# Resize the filesystem
sudo resize2fs /dev/nvme0n1p1

# Verify
df -h
```

> **Recommendation:** Use at least **20GB** when deploying ML-heavy Docker images.

---

### Challenge 5 — ECR Repository Does Not Exist

**Error:**
```
error from registry: The repository with name '***' does not
exist in the registry with id '220438081445'
```

**Cause:**
The ECR repository was never created in AWS before trying to push the Docker image to it.

**Solution:**

**Option A — AWS Console:**
1. Go to **AWS Console → ECR → Repositories**
2. Click **Create repository**
3. Set visibility: **Private**
4. Enter repository name — must **exactly match** `ECR_REPOSITORY_NAME` secret (all lowercase)
5. Click **Create repository**

**Option B — AWS CLI:**
```bash
aws ecr create-repository \
  --repository-name ats-ecr \
  --region us-east-1
```

---

### Challenge 6 — Node.js 20 Deprecation Warning

**Warning:**
```
Node.js 20 actions are deprecated. Actions will be forced to run
with Node.js 24 by default starting June 16th, 2026.
```

**Cause:**
GitHub Actions like `actions/checkout@v4` and `aws-actions/configure-aws-credentials@v4` were running on the deprecated Node.js 20 runtime on the self-hosted runner.

**Solution:**
Add the following environment variable to the deploy job to opt into Node.js 24:

```yaml
jobs:
  deploy:
    runs-on: self-hosted
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

---

## Deployment Pipeline Overview

```
Push to main
     │
     ▼
GitHub Actions Triggered
     │
     ▼
Self-Hosted Runner (EC2) picks up job
     │
     ├── Checkout Repository
     ├── Configure AWS Credentials (IAM)
     ├── Login to Amazon ECR
     ├── Set Lowercase Image URI
     ├── Build Docker Image (./backend/Dockerfile)
     ├── Push Image to ECR
     ├── Pull Latest Image from ECR
     ├── Stop & Remove Existing Container
     ├── Run New Container (port 8000)
     └── Cleanup Unused Docker Images
```

---

## EC2 Security Group Rules

| Port | Protocol | Source | Purpose |
|---|---|---|---|
| 22 | TCP | 0.0.0.0/0 | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 8000 | TCP | 0.0.0.0/0 | FastAPI backend |

---

## Verifying the Deployment

After a successful pipeline run, verify on EC2:

```bash
# Check container is running
docker ps

# Test API health
curl http://localhost:8000
```

Expected response:
```json
{"message":"ATS System is running","version":"1.0.0","status":"healthy"}
```

Public access:
```
http://<your-ec2-public-ip>:8000
```

---

## Key Lessons Learned

| # | Lesson |
|---|---|
| 1 | Always verify GitHub secrets are set correctly before debugging workflow logic |
| 2 | Docker image names must be **all lowercase** — enforce with `tr '[:upper:]' '[:lower:]'` |
| 3 | Self-hosted runner user must be in the `docker` group |
| 4 | ML-heavy Docker images need **20GB+** EC2 storage |
| 5 | Always create the ECR repository **before** running the pipeline |
| 6 | Use `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` to stay ahead of Node.js deprecations |
| 7 | Add `docker image prune -af` at the end of every pipeline to keep disk usage low |


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
