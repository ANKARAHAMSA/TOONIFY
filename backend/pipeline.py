"""
Stable Diffusion img2img pipeline wrapper.
Handles device detection (CUDA / MPS / CPU) and lazy loading.
"""
import os
import io
import logging
from typing import Optional

from PIL import Image, ImageFilter, ImageEnhance

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Style presets
# ---------------------------------------------------------------------------
STYLES: dict[str, dict] = {
    "disney": {
        "key": "disney",
        "label": "Modern Disney",
        "description": "Vibrant, expressive Disney animation style",
        "prompt_modifier": "modern disney style, cartoon, vibrant colors, expressive, smooth shading, high quality",
        "emoji": "🏰",
    },
    "anime": {
        "key": "anime",
        "label": "Anime",
        "description": "Clean, detailed Japanese anime aesthetic",
        "prompt_modifier": "anime style, detailed, studio quality, clean lines, cel shading, beautiful",
        "emoji": "⛩️",
    },
    "ghibli": {
        "key": "ghibli",
        "label": "Studio Ghibli",
        "description": "Soft, painterly Ghibli-inspired artwork",
        "prompt_modifier": "studio ghibli style, painted, whimsical, soft colors, hand-drawn, miyazaki",
        "emoji": "🌿",
    },
    "comic": {
        "key": "comic",
        "label": "Comic Book",
        "description": "Bold lines and vibrant comic book panels",
        "prompt_modifier": "comic book style, bold outlines, halftone, vibrant colors, dynamic, pop art",
        "emoji": "💥",
    },
    "pixar": {
        "key": "pixar",
        "label": "Pixar 3D",
        "description": "Warm, expressive Pixar-style 3D look",
        "prompt_modifier": "pixar 3d animation style, cute, detailed, warm lighting, subsurface scattering",
        "emoji": "✨",
    },
}

NEGATIVE_PROMPT = (
    "ugly, blurry, low quality, deformed, disfigured, extra limbs, "
    "watermark, text, nsfw, realistic photo"
)

# ---------------------------------------------------------------------------
# Pipeline state (module-level singleton)
# ---------------------------------------------------------------------------
_pipe = None
_device: Optional[str] = None
_mock_mode: bool = False


def _detect_device() -> str:
    try:
        import torch
        if torch.cuda.is_available():
            return "cuda"
        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
    except ImportError:
        pass
    return "cpu"


def init_pipeline(model_path: str, mock: bool = False) -> None:
    """Load the SD img2img pipeline into memory. Call once at startup."""
    global _pipe, _device, _mock_mode

    _mock_mode = mock
    if mock:
        logger.info("Running in MOCK mode — no real model loaded.")
        return

    import torch  # lazy — not needed in mock mode
    _device = _detect_device()
    logger.info(f"Loading pipeline from '{model_path}' on device: {_device}")

    from diffusers import StableDiffusionImg2ImgPipeline  # lazy import

    dtype = torch.float16 if _device in ("cuda", "mps") else torch.float32
    _pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_path, torch_dtype=dtype
    )
    _pipe = _pipe.to(_device)

    # Memory optimisations
    if _device == "cuda":
        _pipe.enable_xformers_memory_efficient_attention()
    _pipe.enable_attention_slicing()

    logger.info("Pipeline loaded successfully.")


def is_loaded() -> bool:
    return _mock_mode or _pipe is not None


def get_device() -> str:
    return _device or "none"


def get_mock_mode() -> bool:
    return _mock_mode


# ---------------------------------------------------------------------------
# Cartoonize
# ---------------------------------------------------------------------------
def cartoonize(
    image: Image.Image,
    style_key: str,
    strength: float = 0.72,
    guidance_scale: float = 7.5,
    num_steps: int = 30,
) -> Image.Image:
    """
    Run img2img cartoonization.
    Returns a PIL Image.
    """
    if style_key not in STYLES:
        raise ValueError(f"Unknown style '{style_key}'. Valid: {list(STYLES)}")

    style = STYLES[style_key]
    prompt = f"portrait, {style['prompt_modifier']}, masterpiece, best quality"

    # ---- Mock mode --------------------------------------------------------
    if _mock_mode:
        return _mock_cartoonize(image, style_key)

    # ---- Real inference ---------------------------------------------------
    if _pipe is None:
        raise RuntimeError("Pipeline not initialized. Call init_pipeline() first.")

    # Resize to 512×512 (SD1.5 native resolution)
    img = image.convert("RGB").resize((512, 512), Image.LANCZOS)

    result = _pipe(
        prompt=prompt,
        negative_prompt=NEGATIVE_PROMPT,
        image=img,
        strength=strength,
        guidance_scale=guidance_scale,
        num_inference_steps=num_steps,
    ).images[0]

    return result


# ---------------------------------------------------------------------------
# Mock cartoonizer (no GPU needed — for frontend dev)
# ---------------------------------------------------------------------------
def _mock_cartoonize(image: Image.Image, style_key: str) -> Image.Image:
    """
    Produces a stylized-looking mock output by applying PIL filters.
    Used when --mock flag is set, so the frontend can be developed
    without needing a real GPU or loaded model.
    """
    img = image.convert("RGB").resize((512, 512), Image.LANCZOS)

    style_filters = {
        "disney": lambda i: ImageEnhance.Color(i.filter(ImageFilter.SMOOTH_MORE)).enhance(1.8),
        "anime":  lambda i: ImageEnhance.Sharpness(i.filter(ImageFilter.EDGE_ENHANCE_MORE)).enhance(2.0),
        "ghibli": lambda i: ImageEnhance.Brightness(i.filter(ImageFilter.GaussianBlur(1))).enhance(1.1),
        "comic":  lambda i: ImageEnhance.Contrast(i.filter(ImageFilter.EDGE_ENHANCE_MORE)).enhance(1.5),
        "pixar":  lambda i: ImageEnhance.Color(i.filter(ImageFilter.SMOOTH)).enhance(2.2),
    }

    fn = style_filters.get(style_key, lambda i: i)
    return fn(img)
