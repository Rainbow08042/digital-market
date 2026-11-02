"""Export the approved ABOUT concept series, retaining UI artwork separately."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = [
    ("knowledge", "01-knowledge"),
    ("meeting", "02-meeting"),
    ("news", "03-news"),
    ("legal", "04-legal"),
    ("code", "05-code"),
]

def main():
    sources = [(ROOT / "assets/drafts/about-concept" / f"{key}-concept-v1.png", name) for key, name in ASSETS]
    for source, _ in sources:
        if not source.is_file():
            raise FileNotFoundError(source)
    destination = ROOT / "public/media/digital-market"
    destination.mkdir(parents=True, exist_ok=True)
    for source, name in sources:
        with Image.open(source) as original:
            image = original.convert("RGB")
            image.thumbnail((1024, 1536), Image.Resampling.LANCZOS)
            output = destination / f"about-{name}-concept-v1.webp"
            image.save(output, "WEBP", quality=92, method=6)
            print(f"{output.name}: {image.width}x{image.height}, {output.stat().st_size:,} bytes")

if __name__ == "__main__":
    main()
