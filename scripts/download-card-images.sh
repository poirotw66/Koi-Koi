#!/usr/bin/env bash
# Downloads Louie Mantia Hanafuda SVGs (CC BY-SA 4.0) from Wikimedia Commons.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/cards"
BASE_URL="https://commons.wikimedia.org/wiki/Special:FilePath"

mkdir -p "$OUT"

download() {
  local card_id="$1"
  local filename="$2"
  local target="$OUT/${card_id}.svg"
  if [[ -f "$target" ]]; then
    echo "skip $card_id"
    return
  fi
  echo "fetch $card_id <- $filename"
  sleep 0.5
  curl -fsSL "${BASE_URL}/${filename// /_}" -o "$target"
}

download "back" "Hanafuda card back Alt.svg"

download "1-1" "Hanafuda January Hikari Alt.svg"
download "1-2" "Hanafuda January Tanzaku Alt.svg"
download "1-3" "Hanafuda January Kasu 1 Alt.svg"
download "1-4" "Hanafuda January Kasu 2 Alt.svg"

download "2-1" "Hanafuda February Tane Alt.svg"
download "2-2" "Hanafuda February Tanzaku Alt.svg"
download "2-3" "Hanafuda February Kasu 1 Alt.svg"
download "2-4" "Hanafuda February Kasu 2 Alt.svg"

download "3-1" "Hanafuda March Hikari Alt.svg"
download "3-2" "Hanafuda March Tanzaku Alt.svg"
download "3-3" "Hanafuda March Kasu 1 Alt.svg"
download "3-4" "Hanafuda March Kasu 2 Alt.svg"

download "4-1" "Hanafuda April Tane Alt.svg"
download "4-2" "Hanafuda April Tanzaku Alt.svg"
download "4-3" "Hanafuda April Kasu 1 Alt.svg"
download "4-4" "Hanafuda April Kasu 2 Alt.svg"

download "5-1" "Hanafuda May Tane Alt.svg"
download "5-2" "Hanafuda May Tanzaku Alt.svg"
download "5-3" "Hanafuda May Kasu 1 Alt.svg"
download "5-4" "Hanafuda May Kasu 2 Alt.svg"

download "6-1" "Hanafuda June Tane Alt.svg"
download "6-2" "Hanafuda June Tanzaku Alt.svg"
download "6-3" "Hanafuda June Kasu 1 Alt.svg"
download "6-4" "Hanafuda June Kasu 2 Alt.svg"

download "7-1" "Hanafuda July Tane Alt.svg"
download "7-2" "Hanafuda July Tanzaku Alt.svg"
download "7-3" "Hanafuda July Kasu 1 Alt.svg"
download "7-4" "Hanafuda July Kasu 2 Alt.svg"

download "8-1" "Hanafuda August Hikari Alt.svg"
download "8-2" "Hanafuda August Tane Alt.svg"
download "8-3" "Hanafuda August Kasu 1 Alt.svg"
download "8-4" "Hanafuda August Kasu 2 Alt.svg"

download "9-1" "Hanafuda September Tane Alt.svg"
download "9-2" "Hanafuda September Tanzaku Alt.svg"
download "9-3" "Hanafuda September Kasu 1 Alt.svg"
download "9-4" "Hanafuda September Kasu 2 Alt.svg"

download "10-1" "Hanafuda October Tane Alt.svg"
download "10-2" "Hanafuda October Tanzaku Alt.svg"
download "10-3" "Hanafuda October Kasu 1 Alt.svg"
download "10-4" "Hanafuda October Kasu 2 Alt.svg"

download "11-1" "Hanafuda November Hikari Alt.svg"
download "11-2" "Hanafuda November Tane Alt.svg"
download "11-3" "Hanafuda November Tanzaku Alt.svg"
download "11-4" "Hanafuda November Kasu Alt.svg"

download "12-1" "Hanafuda December Hikari Alt.svg"
download "12-2" "Hanafuda December Kasu 1 Alt.svg"
download "12-3" "Hanafuda December Kasu 2 Alt.svg"
download "12-4" "Hanafuda December Kasu 3 Alt.svg"

echo "Downloaded $(find "$OUT" -name '*.svg' | wc -l) SVG files to $OUT"
