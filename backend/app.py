import os
import shutil
import logging
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Form,
    HTTPException,
    Request
)
from fastapi.middleware.cors import CORSMiddleware

from embedding_model import EmbeddingModel
from main import ATSScore
from multi_document_loader import load_document
from logger import get_logger

# --------------------------------------------------
# CONFIG
# --------------------------------------------------

UPLOAD_FOLDER = "Temp_Files"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --------------------------------------------------
# LOGGING
# --------------------------------------------------

logger = get_logger(name = 'ATS_Backed_Deployment',log_dir = 'logs',filename ='app.log',level='INFO')

# --------------------------------------------------
# LIFESPAN
# --------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("=" * 50)
    logger.info("🚀 Initializing ATS models...")

    try:
        embedder = EmbeddingModel()
        ats_score = ATSScore(embedder)

        app.state.embedder = embedder
        app.state.ats_score = ats_score

        logger.info("✅ Models loaded successfully!")

    except Exception as e:
        logger.exception("Failed to initialize models")
        raise e

    logger.info("=" * 50)
    logger.info("🎉 ATS Pro Backend Started Successfully!")
    logger.info(f"📁 Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"📊 Max file size: {MAX_FILE_SIZE / (1024 * 1024)} MB")
    logger.info(f"📎 Allowed formats: {ALLOWED_EXTENSIONS}")
    logger.info("=" * 50)

    yield

    logger.info("🛑 ATS Backend shutting down...")

# --------------------------------------------------
# APP INIT
# --------------------------------------------------

app = FastAPI(
    title="ATS System",
    description="Evaluate resumes against job descriptions using semantic + keyword scoring",
    version="1.0.0",
    lifespan=lifespan
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# FILE VALIDATION
# --------------------------------------------------

def validate_file(file: UploadFile):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing"
        )

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}"
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large (max 10MB)"
        )

# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "ATS System is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health/")
def health():
    return {
        "status": "healthy",
        "service": "ATS Backend",
        "version": "1.0.0"
    }

# --------------------------------------------------
# EVALUATE
# --------------------------------------------------

@app.post("/evaluate/")
def evaluate(
    request: Request,
    resume_file: UploadFile = File(...),
    jd_text: str = Form(...)
):

    resume_path = None

    try:

        validate_file(resume_file)

        if not jd_text or not jd_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty"
            )

        resume_path = os.path.join(
            UPLOAD_FOLDER,
            resume_file.filename
        )

        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(
                resume_file.file,
                buffer
            )

        resume_text = load_document(resume_path)

        result = request.app.state.ats_score.final_score(
            resume_text,
            jd_text
        )

        return result

    except HTTPException:
        raise

    except Exception as e:

        logger.exception(
            f"Error processing file: {resume_file.filename}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if resume_path and os.path.exists(resume_path):
            try:
                os.remove(resume_path)
            except Exception as cleanup_error:
                logger.warning(
                    f"Failed to remove temp file: {cleanup_error}"
                )
