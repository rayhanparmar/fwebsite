#!/usr/bin/env python3
"""One-time backfill: create WebP thumbnails for existing product images.

Originals are never modified, moved or deleted. Safe to re-run — images
that already have a thumbnail are skipped.
"""
import io
import os
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

import boto3
from dotenv import load_dotenv
from pymongo import MongoClient
from PIL import Image, ImageOps

load_dotenv(Path(__file__).parent / ".env")

BUCKET = os.getenv("AWS_BUCKET_NAME")
REGION = os.getenv("AWS_REGION")
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

missing = [n for n, v in [
    ("AWS_BUCKET_NAME", BUCKET), ("AWS_REGION", REGION),
    ("MONGO_URL", MONGO_URL), ("DB_NAME", DB_NAME),
] if not v]
if missing:
    sys.exit("Missing in backend/.env: " + ", ".join(missing))

s3 = boto3.client(
    "s3",
    region_name=REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

db = MongoClient(
    MONGO_URL, tls=True, tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=30000,
)[DB_NAME]

VIDEO_EXT = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
MAX_SIZE = 800


def s3_key_from(url):
    if not url:
        return None
    if url.startswith("/api/files/"):
        return unquote(url[len("/api/files/"):])
    if url.startswith("http"):
        host = urlparse(url).netloc
        if BUCKET not in host and "amazonaws.com" not in host:
            return None  # external image (Unsplash placeholder etc.)
        return unquote(urlparse(url).path.lstrip("/"))
    return None


def public_url(key):
    return f"https://{BUCKET}.s3.{REGION}.amazonaws.com/{key}"


def build_thumb(key):
    if os.path.splitext(key)[1].lower() in VIDEO_EXT:
        return None

    thumb_key = key.rsplit(".", 1)[0] + "_thumb.webp"

    try:
        s3.head_object(Bucket=BUCKET, Key=thumb_key)
        return public_url(thumb_key)
    except Exception:
        pass

    data = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()

    img = Image.open(io.BytesIO(data))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
    img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=82, method=4)
    buf.seek(0)

    s3.upload_fileobj(buf, BUCKET, thumb_key,
                      ExtraArgs={"ContentType": "image/webp"})
    return public_url(thumb_key)


products = list(db.products.find({}))
print(f"{len(products)} products found")

done = made = skipped = failed = 0

for p in products:
    imgs = list(p.get("images") or [])
    if not imgs:
        continue

    thumbs = list(p.get("thumbnails") or [])
    while len(thumbs) < len(imgs):
        thumbs.append(None)

    changed = False
    for i, url in enumerate(imgs):
        if thumbs[i]:
            skipped += 1
            continue
        key = s3_key_from(url)
        if not key:
            continue
        try:
            thumbs[i] = build_thumb(key)
            if thumbs[i]:
                made += 1
            changed = True
        except Exception as exc:
            failed += 1
            print(f"  ! {p.get('product_id')} [{i}]: {exc}")

    if changed:
        db.products.update_one({"_id": p["_id"]},
                               {"$set": {"thumbnails": thumbs}})

    done += 1
    if done % 25 == 0:
        print(f"  {done}/{len(products)} ... {made} created")

print(f"\nDone — {made} created, {skipped} already existed, {failed} failed")
