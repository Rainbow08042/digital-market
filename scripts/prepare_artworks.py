"""Compress transparent screenshots rendered from the project's own 3D model."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
target = root / "public" / "artworks"
target.mkdir(parents=True, exist_ok=True)
for category in ["office", "creative", "research", "service", "finance", "specialist"]:
    image = Image.open(root / "output" / "playwright" / f"robot-{category}.png").convert("RGBA")
    image.save(target / f"{category}.webp", "WEBP", quality=88, method=6)
    if category == "office":
        image.save(target / "hero-fallback.webp", "WEBP", quality=90, method=6)
    print(category, image.size, "alpha", image.getextrema()[3])
