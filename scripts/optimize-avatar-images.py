#!/usr/bin/env python3
"""Re-crop avatar images for circular display: zoom into face, square output."""

from pathlib import Path

from PIL import Image

AVATAR_SIZE = 512
FACE_TOP_BIAS = 0.06
CROP_WIDTH_RATIO = 0.88
CROP_HEIGHT_RATIO = 0.82


def optimize_avatar(path: Path) -> None:
    image = Image.open(path).convert('RGB')
    width, height = image.size

    crop_w = int(width * CROP_WIDTH_RATIO)
    crop_h = int(height * CROP_HEIGHT_RATIO)
    left = (width - crop_w) // 2
    top = int(height * FACE_TOP_BIAS)

    cropped = image.crop((left, top, left + crop_w, top + crop_h))
    resized = cropped.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
    resized.save(path, 'WEBP', quality=86, method=6)
    print(f'optimized {path.name} -> {AVATAR_SIZE}x{AVATAR_SIZE}')


def main() -> None:
    roots = [
        Path('/workspace/public/avatars/characters'),
        Path('/workspace/public/avatars'),
    ]
    for root in roots:
        if not root.exists():
            continue
        for path in sorted(root.glob('*.webp')):
            optimize_avatar(path)


if __name__ == '__main__':
    main()
