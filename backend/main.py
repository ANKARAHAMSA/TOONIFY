"""
FastAPI backend for AI Cartoon Generator.

Usage:
  # Real mode (requires model weights at MODEL_PATH)
  uvicorn main:app --reload

  # Mock mode (PIL filters, no GPU needed — for frontend dev)
  MOCK_MODE=true uvicorn main:app --reload

Environment variables:
  MODEL_PATH   Path to local model dir or HuggingFace repo ID
               Default: ./mo-di-diffusion
  MOCK_MODE    Set to "true" to use mock PIL cartoonizer
               Default: false
  PORT         Server port (used by some hosting platforms)
               Default: 8000
"""
import io
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from PIL import Image

import pipeline as pl
from models import HealthResponse, StyleInfo

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL_PATH = os.getenv("MODEL_PATH", "./mo-di-diffusion")
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting up — mock={MOCK_MODE}, model_path={MODEL_PATH}")
    pl.init_pipeline(MODEL_PATH, mock=MOCK_MODE)
    yield
    logger.info("Shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Cartoon Generator API",
    description="Upload a photo, pick a style, get a cartoon. 🎨",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA fallback
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    """Returns API health status and model load state."""
    return HealthResponse(
        status="ok",
        model_loaded=pl.is_loaded(),
        device=pl.get_device(),
        mock_mode=pl.get_mock_mode(),
    )


@app.get("/styles", response_model=list[StyleInfo], tags=["Styles"])
async def get_styles():
    """Returns all available cartoon style presets."""
    return [StyleInfo(**s) for s in pl.STYLES.values()]


@app.post("/cartoonize", tags=["Generate"])
async def cartoonize(
    image: UploadFile = File(..., description="Input photo (JPEG/PNG)"),
    style: str = Form("disney", description="Style key — disney | anime | ghibli | comic | pixar"),
    strength: float = Form(0.72, description="Transformation strength (0.0–1.0). Higher = more cartoon."),
    guidance_scale: float = Form(7.5, description="Prompt guidance scale"),
    num_steps: int = Form(30, description="Inference steps (more = slower but better)"),
):
    """
    Cartoonize an uploaded photo.

    - Returns the cartoonized image as `image/jpeg`.
    - Works in mock mode (PIL filters) when MOCK_MODE=true.
    """
    # --- Validate style ---
    if style not in pl.STYLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid style '{style}'. Valid options: {list(pl.STYLES.keys())}",
        )

    # --- Validate strength ---
    if not (0.0 < strength <= 1.0):
        raise HTTPException(status_code=400, detail="strength must be between 0.0 and 1.0")

    # --- Read image ---
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file.")

    try:
        pil_image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image. Please upload a valid JPEG or PNG.")

    # --- Run pipeline ---
    try:
        result = pl.cartoonize(
            image=pil_image,
            style_key=style,
            strength=strength,
            guidance_scale=guidance_scale,
            num_steps=num_steps,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Cartoonization failed")
        raise HTTPException(status_code=500, detail="Internal error during generation.")

    # --- Return as JPEG ---
    buf = io.BytesIO()
    result.save(buf, format="JPEG", quality=92)
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="image/jpeg",
        headers={"Content-Disposition": "attachment; filename=cartoon.jpg"},
    )


# ---------------------------------------------------------------------------
# Dev entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
