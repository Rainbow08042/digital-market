"""Export the five selected cover drafts as web-ready assets."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
COVERS = [
    ("browser-automation-cover-v3.png", "cover-01-browser-automation.webp"),
    ("presentation-designer-cover-v2.png", "cover-02-presentation-designer.webp"),
    ("industry-researcher-cover-v1.png", "cover-03-industry-researcher.webp"),
    ("enterprise-support-cover-v1.png", "cover-04-enterprise-support.webp"),
    ("video-editor-cover-v1.png", "cover-05-video-editor.webp"),
]

def main():
    sources = [(ROOT / "assets" / "drafts" / source, target) for source, target in COVERS]
    for source, _ in sources:
        if not source.is_file():
            raise FileNotFoundError(source)
    destination = ROOT / "public" / "media" / "digital-market"
    destination.mkdir(parents=True, exist_ok=True)
    for source, target in sources:
        with Image.open(source) as image:
            image = image.convert("RGB")
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            output = destination / target
            image.save(output, "WEBP", quality=90, method=6)
            print(f"{target}: {image.width}x{image.height}, {output.stat().st_size:,} bytes")

if __name__ == "__main__":
    main()
