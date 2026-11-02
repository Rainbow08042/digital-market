"""Measure frame continuity without modifying the input video."""
import argparse
import json
import statistics
import subprocess
from pathlib import Path


parser = argparse.ArgumentParser()
parser.add_argument("video", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
if args.output.exists():
    raise SystemExit("Output exists; choose a new metrics filename.")
source = args.video.resolve(strict=True)
probe = json.loads(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(source)
], text=True, encoding="utf-8"))
video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
width, height = 320, 180
raw = subprocess.check_output([
    "ffmpeg", "-nostdin", "-v", "error", "-i", str(source),
    "-vf", f"scale={width}:{height}", "-pix_fmt", "gray", "-f", "rawvideo", "-"
])
frame_bytes = width * height
frames = [raw[start:start + frame_bytes] for start in range(0, len(raw), frame_bytes)]
if len(frames) < 2 or any(len(frame) != frame_bytes for frame in frames):
    raise SystemExit("Could not decode at least two complete frames.")


def difference(first, second):
    return sum(abs(a - b) for a, b in zip(first, second)) / frame_bytes


steps = [difference(first, second) for first, second in zip(frames, frames[1:])]
result = {
    "source": str(source),
    "durationSeconds": float(probe["format"]["duration"]),
    "width": video["width"],
    "height": video["height"],
    "frameRate": video["r_frame_rate"],
    "decodedFrames": len(frames),
    "analysisResolution": [width, height],
    "meanAbsoluteDifferenceUnits": "8-bit grayscale levels; 0 means identical",
    "firstLastDifference": difference(frames[0], frames[-1]),
    "medianAdjacentDifference": statistics.median(steps),
    "maximumAdjacentDifference": max(steps),
    "firstTwelveTransitions": steps[:12],
    "lastTwelveTransitions": steps[-12:],
    "note": "Pixel continuity is bounded evidence; review motion and geometry visually as well."
}
args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
