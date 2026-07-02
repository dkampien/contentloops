#!/usr/bin/env bash
# Extract the LAST frame of each clip_*.mp4 in an ad's pool dir for vision review.
# Usage: extract-clip-frames.sh <ad-id>
set -e

AD_ID="$1"
if [ -z "$AD_ID" ]; then
  echo "usage: extract-clip-frames.sh <ad-id>" >&2
  exit 1
fi

POOL_DIR="/Users/dennisk/Documents/project - bib content gen/_projects/cloops-ads/productions/cycle-1/$AD_ID/pool"
OUT_DIR="/tmp/$AD_ID-review"
mkdir -p "$OUT_DIR"

for clip in "$POOL_DIR"/clip_*.mp4; do
  [ -e "$clip" ] || continue
  name="$(basename "$clip" .mp4)"
  out="$OUT_DIR/${name}_last.png"
  ffmpeg -nostdin -v error -sseof -0.3 -i "$clip" -frames:v 1 -q:v 2 "$out" -y
  echo "$out"
done

echo "Review frames written to: $OUT_DIR"
