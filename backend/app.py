import os
import shutil
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from embedding_model import EmbeddingModel
    from main import ATSScore
    from multi_document_loader import load_document
except ImportError:
    from .embedding_model import EmbeddingModel
    from .main import ATSScore
    from .multi_document_loader import load_document

# ---------------- LOGGING ---------------- #
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- APP INIT ---------------- #
app = FastAPI(
    title="ATS System",
    description="Evaluate resumes against job descriptions using semantic + keyword scoring",
    version="1.0.0"
)

# ---------------- CORS ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ats-pro-system.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000"
    ], 
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ---------------- MODEL INIT ---------------- #
logger.info("🚀 Initializing ATS models...")
embedder = EmbeddingModel()
ats_score = ATSScore(embedder)
logger.info("✅ Models loaded successfully!")

# ---------------- CONFIG ---------------- #
UPLOAD_FOLDER = "Temp_Files"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- VALIDATION ---------------- #
def validate_file(file: UploadFile):
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    # Check actual file size
    file.file.seek(0, 2)  
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

# ---------------- ROUTES ---------------- #
@app.get("/")
def root():
    return {
        "message": "ATS System is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health/")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "all-MiniLM-L6-v2",
        "supported_files": list(ALLOWED_EXTENSIONS),
        "max_file_size_MB": MAX_FILE_SIZE / (1024 * 1024)
    }

@app.post("/evaluate/")
def evaluate(
    resume_file: UploadFile = File(...),
    jd_text: str = Form(...)
):
    resume_path = None
    try:
        validate_file(resume_file)
        
        if not jd_text or not jd_text.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")
        
        # Save file temporarily
        resume_path = os.path.join(UPLOAD_FOLDER, resume_file.filename)
        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(resume_file.file, buffer)
        
        logger.info(f"📄 File received: {resume_file.filename}")
        
        # Load text
        resume_text = load_document(resume_path)
        logger.info("✅ Resume loaded successfully")
        
        # Evaluate
        result = ats_score.final_score(resume_text, jd_text)
        logger.info(f"🎯 Evaluation done. Score: {result['final_score']}")
        
        return result
        
    except HTTPException as e:
        logger.error(f"❌ HTTP error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        # Clean up file
        if resume_path and os.path.exists(resume_path):
            try:
                os.remove(resume_path)
                logger.info(f"🗑️ Deleted file: {resume_file.filename}")
            except Exception as e:
                logger.error(f"⚠️ Cleanup error: {str(e)}")

# ---------------- STARTUP EVENT ---------------- #
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 50)
    logger.info("🎉 ATS Pro Backend Started Successfully!")
    logger.info(f"📁 Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"📊 Max file size: {MAX_FILE_SIZE / (1024*1024)} MB")
    logger.info(f"📎 Allowed formats: {ALLOWED_EXTENSIONS}")
    logger.info("=" * 50)


