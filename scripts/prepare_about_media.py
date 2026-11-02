"""Export editable ABOUT drafts to stable web asset paths."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = [
    ("knowledge-base", "01-knowledge"),
    ("meeting", "02-meeting"),
    ("news", "03-news"),
    ("legal", "04-legal"),
    ("code", "05-code"),
]
# Result-only views, in source 1024x1536 coordinates; full originals stay available.
RESULT_BOXES = [
    (45, 610, 980, 1375),
    (50, 600, 975, 1400),
    (55, 590, 970, 1320),
    (55, 565, 970, 1330),
    (55, 585, 975, 1250),
]

def main():
    sources = [(ROOT / "assets/drafts/about-ui" / f"{draft}-v1.png", name) for draft, name in ASSETS]
    for source, _ in sources:
        if not source.is_file():
            raise FileNotFoundError(source)
    destination = ROOT / "public/media/digital-market"
    destination.mkdir(parents=True, exist_ok=True)
    for index, (source, name) in enumerate(sources):
        with Image.open(source) as image:
            image = image.convert("RGB")
            image.thumbnail((1024, 1536), Image.Resampling.LANCZOS)
            output = destination / f"about-{name}.webp"
            image.save(output, "WEBP", quality=92, method=6)
            print(f"{output.name}: {image.width}x{image.height}, {output.stat().st_size:,} bytes")
            # Scale crop coordinates if a future draft uses a different resolution.
            box = RESULT_BOXES[index]
            scaled = tuple(round(value * (image.width / 1024 if i % 2 == 0 else image.height / 1536)) for i, value in enumerate(box))
            preview = image.crop(scaled)
            preview.save(destination / f"about-{name}-preview.webp", "WEBP", quality=92, method=6)

if __name__ == "__main__":
    main()
