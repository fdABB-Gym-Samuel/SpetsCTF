#!/usr/bin/env bash

set -eu

cd "$(dirname "$0")"

if ! command -v jq >/dev/null; then
  echo "You need the jq command in path"
  exit 1
fi

echo "Enter name of translation JSON key: "
read translationkey

echo "Enter name of ENGLISH translation: "
read english

echo "Enter name of SWEDISH translation: "
read swedish

echo "Updating translations..."
echo "$translationkey: sv=$swedish, en=$english"

# Update English translations
jq -S --arg key "$translationkey" --arg value "$english" \
  '.[$key] = $value' en.json >en-tmp.json

# Update Swedish translations
jq -S --arg key "$translationkey" --arg value "$swedish" \
  '.[$key] = $value' sv.json >sv-tmp.json

# Move temp files back to original
mv en-tmp.json en.json
mv sv-tmp.json sv.json

echo "Translations updated successfully!"
