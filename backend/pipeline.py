"""
Stable Diffusion img2img pipeline wrapper.
Handles device detection (CUDA / MPS / CPU), lazy loading,
and optional IP-Adapter face consistency (Milestone 2).
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
_ip_adapter_loaded: bool = False


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


def init_pipeline(
    model_path: str,
    mock: bool = False,
    use_ip_adapter: bool = False,
    ip_adapter_scale: float = 0.7,
) -> None:
    """
    Load the SD img2img pipeline into memory. Call once at startup.

    Args:
        model_path:       Local path or HF repo ID for the base model.
        mock:             If True, use PIL filters only (no GPU required).
        use_ip_adapter:   If True, load IP-Adapter face consistency model on top.
        ip_adapter_scale: Strength of face identity lock (0.0–1.0).
                          0.4 = artistic, 0.7 = balanced, 0.9 = strict face lock.
    """
    global _pipe, _device, _mock_mode, _ip_adapter_loaded

    _mock_mode = mock
    if mock:
        logger.info("Running in MOCK mode — no real model loaded.")
        return

    import torch  # lazy — not needed in mock mode
    _device = _detect_device()
    logger.info(f"Loading pipeline from '{model_path}' on device: {_device}")

    from diffusers import StableDiffusionImg2ImgPipeline

    dtype = torch.float16 if _device in ("cuda", "mps") else torch.float32
    _pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_path,
        torch_dtype=dtype,
        safety_checker=None,
        requires_safety_checker=False,
    )
    _pipe = _pipe.to(_device)

    # Memory optimisations
    if _device == "cuda":
        try:
            _pipe.enable_xformers_memory_efficient_attention()
        except Exception:
            pass  # xformers not installed — fine
    _pipe.enable_attention_slicing()

    # ── Optional: IP-Adapter face consistency ──────────────────────────────
    if use_ip_adapter:
        _load_ip_adapter(ip_adapter_scale)

    logger.info("Pipeline loaded successfully.")


def _load_ip_adapter(scale: float = 0.7) -> None:
    """Load IP-Adapter face model on top of the existing pipeline."""
    global _ip_adapter_loaded

    if _pipe is None:
        raise RuntimeError("Base pipeline must be loaded before IP-Adapter.")

    logger.info(f"Loading IP-Adapter (scale={scale})…")
    try:
        _pipe.load_ip_adapter(
            "h94/IP-Adapter",
            subfolder="models",
            weight_name="ip-adapter-full-face_sd15.bin",
        )
        _pipe.set_ip_adapter_scale(scale)
        _ip_adapter_loaded = True
        logger.info("IP-Adapter loaded successfully.")
    except Exception as e:
        logger.warning(f"IP-Adapter failed to load: {e}. Continuing without it.")
        _ip_adapter_loaded = False


def is_loaded() -> bool:
    return _mock_mode or _pipe is not None


def get_device() -> str:
    return _device or "none"


def get_mock_mode() -> bool:
    return _mock_mode


def get_ip_adapter_loaded() -> bool:
    return _ip_adapter_loaded


# ---------------------------------------------------------------------------
# Cartoonize
# ---------------------------------------------------------------------------
def cartoonize(
    image: Image.Image,
    style_key: str,
    strength: float = 0.72,
    guidance_scale: float = 7.5,
    num_steps: int = 30,
    face_image: Optional[Image.Image] = None,
) -> Image.Image:
    """
    Run img2img cartoonization.

    Args:
        image:         The photo to cartoonize.
        style_key:     One of the STYLES keys.
        strength:      img2img denoising strength (0.0–1.0).
        guidance_scale: CFG scale.
        num_steps:     Inference steps.
        face_image:    Optional face reference for IP-Adapter face lock.
                       If provided and IP-Adapter is loaded, preserves face identity.

    Returns:
        PIL Image (512×512 JPEG-ready).
    """
    if style_key not in STYLES:
        raise ValueError(f"Unknown style '{style_key}'. Valid: {list(STYLES)}")

    style = STYLES[style_key]
    gender_hint = "male character, " if face_image is not None else ""
    prompt = f"portrait, {gender_hint}{style['prompt_modifier']}, masterpiece, best quality"

    # ── Mock mode ────────────────────────────────────────────────────────────
    if _mock_mode:
        return _mock_cartoonize(image, style_key)

    # ── Real inference ───────────────────────────────────────────────────────
    if _pipe is None:
        raise RuntimeError("Pipeline not initialized. Call init_pipeline() first.")

    img = image.convert("RGB").resize((512, 512), Image.LANCZOS)

    # Build kwargs — add ip_adapter_image only when both conditions are met
    kwargs: dict = {
        "prompt": prompt,
        "negative_prompt": NEGATIVE_PROMPT,
        "image": img,
        "strength": strength,
        "guidance_scale": guidance_scale,
        "num_inference_steps": num_steps,
    }

    if face_image is not None and _ip_adapter_loaded:
        face_img = face_image.convert("RGB").resize((512, 512), Image.LANCZOS)
        kwargs["ip_adapter_image"] = face_img
        logger.info("Running with IP-Adapter face lock.")
    elif face_image is not None and not _ip_adapter_loaded:
        logger.warning(
            "face_image provided but IP-Adapter not loaded "
            "(set USE_IP_ADAPTER=true to enable). Ignoring face lock."
        )

    result = _pipe(**kwargs).images[0]
    return result


# ---------------------------------------------------------------------------
# Mock cartoonizer (PIL filters — no GPU needed)
# ---------------------------------------------------------------------------
def _mock_cartoonize(image: Image.Image, style_key: str) -> Image.Image:
    """PIL-filter mock for frontend development without a GPU."""
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
