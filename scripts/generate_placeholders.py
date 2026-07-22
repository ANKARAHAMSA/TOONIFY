#!/usr/bin/env python3
"""
generate_placeholders.py — Phase B
Generates 30 valid 512x512 PNG placeholder images for the Arcane LoRA training dataset.
These act as dataset structure placeholders; replace with SD-generated images via Colab.
"""
import os
import json
import random
from PIL import Image, ImageDraw, ImageFilter

random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "training_images", "arcane")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Arcane-style color palette
PALETTE = [
    (10, 10, 40),     # deep navy
    (15, 35, 60),     # dark blue
    (26, 26, 62),     # midnight
    (45, 212, 191),   # teal glow
    (124, 58, 237),   # arcane purple
    (249, 115, 22),   # amber accent
    (14, 165, 233),   # sky blue
    (99, 102, 241),   # indigo
    (236, 72, 153),   # pink glow
]

PROMPTS = [
    "portrait of a young woman in arcane_toonify style, painterly oil texture, blue teal atmosphere, dramatic lighting",
    "close up face of a man in arcane_toonify style, dark background, glowing eyes, high detail",
    "character portrait in arcane_toonify style, vibrant colors, moody lighting, bokeh background",
    "arcane_toonify style portrait, violet and teal tones, sharp features, cinematic",
    "female character in arcane_toonify style, ambient glow, dark fantasy atmosphere",
    "male face in arcane_toonify style, painterly brush strokes, blue haze, detailed",
    "arcane_toonify style portrait of a warrior, glowing tattoos, dark medieval city",
    "young girl in arcane_toonify style, braided hair, teal lighting, expressive eyes",
    "steampunk character in arcane_toonify style, goggles, dark metallic tones, dramatic",
    "arcane_toonify style close-up, oil painting texture, purple and gold color grade",
    "hooded character in arcane_toonify style, mysterious, glowing runes, blue fog",
    "arcane_toonify style portrait, rough painted edges, vivid blues and oranges",
    "scientist character in arcane_toonify style, bright lab background, sharp face",
    "arcane_toonify style portrait of an elder, wise eyes, deep shadows, teal accent",
    "rebel character in arcane_toonify style, grunge aesthetic, neon undercity lights",
    "arcane_toonify style fantasy portrait, magic swirling around, deep color saturation",
    "arcane_toonify style profile view, architectural bokeh, golden hour light",
    "street fighter in arcane_toonify style, intense gaze, blood and dust, dark",
    "arcane_toonify style female warrior, silver armor, glowing blue runes, epic",
    "arcane_toonify style child portrait, innocent expression, colorful undercity",
    "arcane_toonify style portrait, front lighting, intricate face details, painterly",
    "noble character in arcane_toonify style, formal attire, candlelight, moody",
    "arcane_toonify style mercenary, scar on cheek, desert dust, hard shadows",
    "mage character in arcane_toonify style, glowing purple orb, dark robes",
    "arcane_toonify style robot face, glowing circuits, oil painting effect",
    "arcane_toonify style thief, sneaking expression, urban backdrop, low light",
    "healer character in arcane_toonify style, warm golden glow, gentle expression",
    "arcane_toonify style sniper, focused eyes, rooftop, evening light",
    "twin characters in arcane_toonify style, symmetrical composition, blue tones",
    "arcane_toonify style villain, menacing gaze, dark energy swirling, red accents",
]

metadata_entries = []

for idx, (prompt, i) in enumerate(zip(PROMPTS, range(1, 31))):
    # Create canvas with dark base
    img = Image.new("RGB", (512, 512), random.choice(PALETTE[:3]))
    draw = ImageDraw.Draw(img)

    # Add large background blobs for atmosphere
    for _ in range(6):
        cx = random.randint(-60, 572)
        cy = random.randint(-60, 572)
        r = random.randint(80, 220)
        color = random.choice(PALETTE[3:])
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)

    # Add smaller accent circles
    for _ in range(10):
        cx = random.randint(0, 512)
        cy = random.randint(0, 512)
        r = random.randint(10, 50)
        color = random.choice(PALETTE)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)

    # Gaussian blur to create painterly glow effect
    img = img.filter(ImageFilter.GaussianBlur(radius=40))

    # Add subtle noise layer
    noise_layer = Image.new("RGB", (512, 512))
    noise_draw = ImageDraw.Draw(noise_layer)
    for _ in range(2000):
        x, y = random.randint(0, 511), random.randint(0, 511)
        v = random.randint(0, 60)
        noise_draw.point((x, y), fill=(v, v, v))
    img = Image.blend(img, noise_layer, alpha=0.08)

    # Add label overlay (subtle, bottom of frame)
    label_draw = ImageDraw.Draw(img)
    label_draw.rectangle([0, 490, 512, 512], fill=(0, 0, 0))
    label_draw.text((8, 494), f"[PLACEHOLDER] arcane_{i:03d}.png — Replace with SD-generated image", fill=(180, 180, 180))

    fname = f"arcane_{i:03d}.png"
    fpath = os.path.join(OUTPUT_DIR, fname)
    img.save(fpath, "PNG")

    metadata_entries.append({"file_name": fname, "text": prompt})
    print(f"  ✅ {fname} saved ({os.path.getsize(fpath):,} bytes)")

# Write metadata.jsonl
metadata_path = os.path.join(OUTPUT_DIR, "metadata.jsonl")
with open(metadata_path, "w") as f:
    for entry in metadata_entries:
        f.write(json.dumps(entry) + "\n")

print(f"\n✅ Done! Generated {len(metadata_entries)} images + metadata.jsonl")
print(f"📁 Output: {os.path.abspath(OUTPUT_DIR)}")
print("\n⚠️  These are PLACEHOLDER images. Run the Colab LoRA notebook to replace with real SD-generated images.")
