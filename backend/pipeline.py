"""
Stable Diffusion img2img pipeline wrapper.
Handles device detection (CUDA / MPS / CPU), lazy loading,
IP-Adapter face consistency (Milestone 2), and Custom LoRA models (Milestone 3).
"""
import os
import io
import logging
from typing import Optional

from PIL import Image, ImageFilter, ImageEnhance

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Style presets (Includes Custom LoRA styles: Arcane & Claymation)
# ---------------------------------------------------------------------------
STYLES: dict[str, dict] = {
    "disney": {
        "key": "disney",
        "label": "Modern Disney",
        "description": "Vibrant, expressive Disney animation style",
        "prompt_modifier": "modern disney animation style, 3d digital artwork, expressive character, vibrant colors, smooth shading, cinematic lighting, masterpiece",
        "emoji": "🏰",
        "lora": None,
    },
    "anime": {
        "key": "anime",
        "label": "Anime",
        "description": "Clean, detailed Japanese anime aesthetic",
        "prompt_modifier": "anime style, studio quality, detailed eyes, clean lines, cel shaded, makoto shinkai aesthetic, masterpiece",
        "emoji": "⛩️",
        "lora": None,
    },
    "arcane": {
        "key": "arcane",
        "label": "Arcane Painterly",
        "description": "Exclusive painterly style with dramatic neon lighting",
        "prompt_modifier": "in arcane_toonify style, painterly brushstrokes, dramatic side lighting, high contrast, masterpiece portrait, 8k",
        "emoji": "🔮",
        "lora": "arcane_toonify.safetensors",
    },
    "claymation": {
        "key": "claymation",
        "label": "3D Claymation",
        "description": "Tactile stop-motion clay art style",
        "prompt_modifier": "in clay_toonify style, claymation artwork, tactile clay texture, plasticine, stop motion aesthetic, handmade character",
        "emoji": "🧱",
        "lora": "clay_toonify.safetensors",
    },
    "ghibli": {
        "key": "ghibli",
        "label": "Studio Ghibli",
        "description": "Soft, painterly Ghibli-inspired artwork",
        "prompt_modifier": "studio ghibli style, painted, whimsical, soft colors, hand-drawn, miyazaki art, anime background",
        "emoji": "🌿",
        "lora": None,
    },
    "comic": {
        "key": "comic",
        "label": "Comic Book",
        "description": "Bold lines and vibrant comic book panels",
        "prompt_modifier": "comic book illustration style, bold black ink outlines, halftone patterns, vibrant colors, dynamic pop art, Marvel comic style",
        "emoji": "💥",
        "lora": None,
    },
    "pixar": {
        "key": "pixar",
        "label": "Pixar 3D",
        "description": "Warm, expressive Pixar-style 3D look",
        "prompt_modifier": "pixar 3d animation style, cute character, warm lighting, subsurface scattering, detailed 3d render, artstation",
        "emoji": "✨",
        "lora": None,
    },
}

NEGATIVE_PROMPT = (
    "ugly, blurry, low quality, deformed, disfigured, extra limbs, "
    "watermark, text, nsfw, realistic photo, photorealistic, 3d scan, grain, noise"
)

# ---------------------------------------------------------------------------
# Pipeline state (module-level singleton)
# ---------------------------------------------------------------------------
_pipe = None
_device: Optional[str] = None
_mock_mode: bool = False
_ip_adapter_loaded: bool = False
_loaded_lora: Optional[str] = None


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
    ip_adapter_scale: float = 0.40,
) -> None:
    """
    Load the SD img2img pipeline into memory. Call once at startup.
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
            pass

    # ── Optional: IP-Adapter face consistency ──────────────────────────────
    if use_ip_adapter:
        _load_ip_adapter(ip_adapter_scale)

    logger.info("Pipeline loaded successfully.")


def _load_ip_adapter(scale: float = 0.40) -> None:
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


def apply_lora(lora_file: Optional[str], lora_dir: str = "./models/loras", weight: float = 0.8) -> None:
    """Load or unload a custom LoRA weight file into the pipeline."""
    global _pipe, _loaded_lora

    if _pipe is None or _mock_mode:
        return

    if lora_file == _loaded_lora:
        return  # Already loaded

    # If switching or removing LoRA, unload previous
    if _loaded_lora is not None:
        try:
            _pipe.unload_lora_weights()
            _loaded_lora = None
            logger.info("Unloaded previous LoRA weights.")
        except Exception as e:
            logger.warning(f"Failed to unload LoRA: {e}")

    if not lora_file:
        return

    full_path = os.path.join(lora_dir, lora_file)
    if os.path.exists(full_path):
        logger.info(f"Loading custom LoRA from '{full_path}' with weight={weight}…")
        try:
            _pipe.load_lora_weights(full_path)
            _loaded_lora = lora_file
            logger.info(f"Successfully loaded LoRA '{lora_file}'")
        except Exception as e:
            logger.error(f"Failed to load LoRA '{lora_file}': {e}")
    else:
        logger.info(f"LoRA file '{full_path}' not found — using base prompt styling.")


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
    strength: float = 0.70,
    guidance_scale: float = 6.5,
    num_steps: int = 30,
    face_image: Optional[Image.Image] = None,
) -> Image.Image:
    """
    Run img2img cartoonization.
    """
    if style_key not in STYLES:
        raise ValueError(f"Unknown style '{style_key}'. Valid: {list(STYLES)}")

    style = STYLES[style_key]
    prompt = f"portrait, {style['prompt_modifier']}"

    # ── Mock mode ────────────────────────────────----------------────────────
    if _mock_mode:
        return _mock_cartoonize(image, style_key)

    # ── Real inference ────────────────────────────────----------------───────
    if _pipe is None:
        raise RuntimeError("Pipeline not initialized. Call init_pipeline() first.")

    # Apply custom LoRA if applicable
    apply_lora(style.get("lora"))

    img = image.convert("RGB").resize((512, 512), Image.LANCZOS)

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

    result = _pipe(**kwargs).images[0]
    return result


# ---------------------------------------------------------------------------
# Mock cartoonizer (PIL filters — no GPU needed)
# ---------------------------------------------------------------------------
def _mock_cartoonize(image: Image.Image, style_key: str) -> Image.Image:
    """PIL-filter mock for frontend development without a GPU."""
    img = image.convert("RGB").resize((512, 512), Image.LANCZOS)

    style_filters = {
        "disney":     lambda i: ImageEnhance.Color(i.filter(ImageFilter.SMOOTH_MORE)).enhance(1.8),
        "anime":      lambda i: ImageEnhance.Sharpness(i.filter(ImageFilter.EDGE_ENHANCE_MORE)).enhance(2.0),
        "arcane":     lambda i: ImageEnhance.Contrast(ImageEnhance.Color(i).enhance(2.2)).enhance(1.6),
        "claymation": lambda i: ImageEnhance.Brightness(i.filter(ImageFilter.SMOOTH_MORE)).enhance(1.15),
        "ghibli":     lambda i: ImageEnhance.Brightness(i.filter(ImageFilter.GaussianBlur(1))).enhance(1.1),
        "comic":      lambda i: ImageEnhance.Contrast(i.filter(ImageFilter.EDGE_ENHANCE_MORE)).enhance(1.5),
        "pixar":      lambda i: ImageEnhance.Color(i.filter(ImageFilter.SMOOTH)).enhance(2.2),
    }

    fn = style_filters.get(style_key, lambda i: i)
    return fn(img)
