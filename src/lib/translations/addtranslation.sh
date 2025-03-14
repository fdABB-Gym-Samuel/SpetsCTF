#!/usr/bin/env bash

set -eu

cd $(dirname "$0")

if ! command -v jq > /dev/null ; then
  echo "You need the jq command in path"
  exit 1
fi

echo "Enter name of translation JSON key: "
read translationkey

echo "Enter name of ENGLISH translation: "
read english

echo "Enter name of SWEDISH translation: "
read swedish

echo "$translationkey: sv $swedish, en $english"
jq -S --arg key "$translationkey" --arg en "$english" --arg sv "$swedish" \
  '.[$key] = { en: $en, sv: $sv }' translations.json > translations-tmp.json

echo "Moving translations-tmp.json to translations.json..."
mv translations-tmp.json translations.json
