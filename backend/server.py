from pathlib import Path
from dotenv import load_dotenv
from fastapi import Form, Query
from whatsapp_service import send_flow, send_text_message
from flow_crypto import decrypt_request, encrypt_response
from cloudinary.uploader import destroy
from io import BytesIO
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Font
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import bcrypt
import re
import jwt
import uuid
import threading
import random
import requests as http_requests
import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import Response, PlainTextResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from cloudinary_service import (
    upload_whatsapp_image,
    upload_whatsapp_video,
)


AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

def upload_to_s3(file_data, filename, content_type):

    s3.upload_fileobj(
        file_data,
        AWS_BUCKET_NAME,
        filename,
        ExtraArgs={
            "ContentType": content_type
        }
    )

    return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{filename}"

# MongoDB
mongo_url = os.environ['MONGO_URL']
# client = AsyncIOMotorClient(mongo_url)
client = AsyncIOMotorClient(
    mongo_url,
    tls=True,
    tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=30000
)
db = client[os.environ['DB_NAME']]
whatsapp_db = client["whatsapp_orders"]
whatsapp_orders = whatsapp_db["orders"]
counters = whatsapp_db["counters"]

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-change-me')
JWT_ALGORITHM = "HS256"

pending_video_uploads = {}

video_waiting_users = {}
video_upload_timers = {}

VIDEO_TIMEOUT = 600


async def get_next_order_id():

    result = await counters.find_one_and_update(
        {"_id": "order_counter"},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=True
    )

    sequence = result["sequence"]

    return f"ORD-{sequence:06d}"
def video_upload_timeout(sender):

    if sender not in video_waiting_users:
        return

    pending_video_uploads.pop(sender, None)
    video_waiting_users.pop(sender, None)
    video_upload_timers.pop(sender, None)

    send_text_message(
        sender,
        """⌛ Video upload time expired.

Your order has been submitted successfully without a reference video.

Thank you!"""
    )

    print(f"Video upload timed out for {sender}")

app = FastAPI()
print("VERIFY_TOKEN =", os.getenv("VERIFY_TOKEN"))
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ──── CONSTANTS ────
CATEGORIES = [
    {"name": "Bali", "prefix": "BL", "slug": "bali"},
    {"name": "Bangle/Kada", "prefix": "BK", "slug": "bangle-kada"},
    {"name": "Bracelet", "prefix": "BR", "slug": "bracelet"},
    {"name": "Chain + Multilayer", "prefix": "CM", "slug": "chain-multilayer"},
    {"name": "Cufflink", "prefix": "CF", "slug": "cufflink"},
    {"name": "Brooch", "prefix": "BC", "slug": "brooch"},
    {"name": "Earring", "prefix": "ER", "slug": "earring"},
    {"name": "Haathpaan", "prefix": "HP", "slug": "haathpaan"},
    {"name": "Maang Tikka", "prefix": "MT", "slug": "maang-tikka"},
    {"name": "Mangal Sutra", "prefix": "MS", "slug": "mangal-sutra"},
    {"name": "Necklace", "prefix": "NK", "slug": "necklace"},
    {"name": "Nose Pin", "prefix": "NP", "slug": "nose-pin"},
    {"name": "Pendant + Dancing Stone", "prefix": "PD", "slug": "pendant-dancing-stone"},
    {"name": "Ring + Titanium Ring", "prefix": "RT", "slug": "ring-titanium-ring"},
    {"name": "Tops", "prefix": "TP", "slug": "tops"},
    {"name": "Watch Belt", "prefix": "WB", "slug": "watch-belt"},
    {"name": "Full Set", "prefix": "FS", "slug": "full-set"},
]

CATEGORY_ALIASES = {
    "Bali": ["Bali"],

    "Bangle/Kada": ["Bangle", "Kada"],

    "Bracelet": ["Bracelet"],

    "Chain + Multilayer": ["Chains"],

    "Cufflink": ["Cufflinks"],

    "Brooch": ["Brooch"],

    "Earring": ["Earrings"],

    "Haathpaan": ["Hath Pan"],

    "Maang Tikka": ["Maang Tikka"],

    "Mangal Sutra": ["Mangal Sutra"],

    "Necklace": ["Necklace"],

    "Nose Pin": ["Nose Pin"],

    "Pendant + Dancing Stone": ["Pendant"],

    "Ring + Titanium Ring": ["Rings"],

    "Tops": ["Tops"],

    "Watch Belt": ["Watchbelts"],

    "Full Set": ["Full Set"],
}

STOCK_IMAGES = {
    "Bali": ["https://images.unsplash.com/photo-1723361656146-f201d215c49c?w=500&q=80"],
    "Bangle": ["https://images.unsplash.com/photo-1723361656145-b481be3f9e05?w=500&q=80"],
    "Kada": ["https://images.unsplash.com/photo-1723361656062-ed14986c7f1a?w=500&q=80"],
    "Bracelet": ["https://images.unsplash.com/photo-1723361656145-b481be3f9e05?w=500&q=80"],
    "Chains": ["https://images.pexels.com/photos/17833829/pexels-photo-17833829.jpeg?auto=compress&w=500"],
    "Cufflinks": ["https://images.unsplash.com/photo-1726507367666-08c5f025bdf6?w=500&q=80"],
    "Earrings": ["https://images.unsplash.com/photo-1630019925419-5fc53b4a52cf?w=500&q=80"],
    "Hath Pan": ["https://images.unsplash.com/photo-1723361656145-b481be3f9e05?w=500&q=80"],
    "Maang Tikka": ["https://images.unsplash.com/photo-1723726871280-ab921c7e60c0?w=500&q=80"],
    "Mangal Sutra": ["https://images.unsplash.com/photo-1717282924526-07a7373bb142?w=500&q=80"],
    "Necklace": ["https://images.pexels.com/photos/17833830/pexels-photo-17833830.jpeg?auto=compress&w=500"],
    "Nose Pin": ["https://images.unsplash.com/photo-1587947330318-88fcd9055420?w=500&q=80"],
    "Pendant": ["https://images.unsplash.com/photo-1689775703655-6d999e38e64c?w=500&q=80"],
    "Rings": ["https://images.unsplash.com/photo-1587947330318-88fcd9055420?w=500&q=80"],
    "Tops": ["https://images.unsplash.com/photo-1723361656146-f201d215c49c?w=500&q=80"],
    "Watchbelts": ["https://images.unsplash.com/photo-1726507367666-08c5f025bdf6?w=500&q=80"],
}

# ──── AUTH HELPERS ────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(401, "User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user

async def get_approved_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") == "admin":
        return user
    if not user.get("approved"):
        raise HTTPException(403, "Account pending approval")
    return user

# ──── MODELS ────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    business_name: str
    gst_number: str
    phone: str
    state: str
    city: str
    business_address: str
    pincode: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CartItemRequest(BaseModel):
    product_id: str
    category: str
    image: str
    customizations: Dict[str, str]
    notes: Optional[str] = ""

class EnquiryRequest(BaseModel):
    notes: Optional[str] = ""

class CustomisationRequest(BaseModel):
    metal_type: str
    stone_changes: str
    size_changes: str
    special_notes: str
    reference_description: Optional[str] = ""
    file_url: Optional[str] = ""
    file_name: Optional[str] = ""

class ContactRequest(BaseModel):
    name: str
    email: str
    phone: str
    message: str

class ProductCreate(BaseModel):
    product_id: str
    category: str
    images: List[str]
    rating: float = 5.0

class ProductUpdate(BaseModel):
    product_id: Optional[str] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    rating: Optional[float] = None

class WhatsAppOrderUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignedTo: Optional[str] = None
    admin_notes: Optional[str] = None

# ──── AUTH ENDPOINTS ────
@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_doc = {
    "name": req.name,
    "email": email,
    "password_hash": hash_password(req.password),
    "business_name": req.business_name,
    "gst_number": req.gst_number,
    "phone": req.phone,
    "state": req.state,
    "city": req.city,
    "business_address": req.business_address,
    "pincode": req.pincode,
    "role": "retailer",
    "approved": False,
    "created_at": datetime.now(timezone.utc).isoformat()
}
    result = await db.users.insert_one(user_doc)
    logger.info(f"New retailer registration: {req.name} ({email})")
    return {
        "message": "Registration successful! Your account is pending approval by the admin.",
        "user": {"_id": str(result.inserted_id), "name": req.name, "email": email, "role": "retailer", "approved": False}
    }

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    if user.get("role") == "retailer" and not user.get("approved"):
        raise HTTPException(403, "Your account is pending approval. Please wait for admin verification.")
    user_id = str(user["_id"])
    token = create_access_token(user_id, email, user["role"])
    return {
        "token": token,
        "user": {
            "_id": user_id, "name": user["name"], "email": user["email"],
            "role": user["role"], "approved": user.get("approved", False),
            "business_name": user.get("business_name", ""),
            "phone": user.get("phone", ""),
        }
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {"user": user}

# ──── CATEGORIES ────
@api_router.get("/categories")
async def get_categories():
    cats = []
    for cat in CATEGORIES:
        count = await db.products.count_documents({"category": cat["name"]})
        sample = await db.products.find_one({"category": cat["name"]}, {"_id": 0, "images": 1})
        image = sample["images"][0] if sample and sample.get("images") else STOCK_IMAGES.get(cat["name"], [""])[0]
        cats.append({"name": cat["name"], "slug": cat["slug"], "prefix": cat["prefix"], "image": image, "product_count": count})
    return {"categories": cats}

# ──── PRODUCTS ────
@api_router.get("/products")
async def get_products(category: Optional[str] = None, page: int = 1, limit: int = 30, search: Optional[str] = None):
    query = {}
    if category:
        category_names = CATEGORY_ALIASES.get(category, [category])
        query["category"] = {"$in": category_names}
    if search:
        query["product_id"] = {"$regex": search, "$options": "i"}
    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return {"products": products, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(404, "Product not found")
    return {"product": product}

# ──── CART ────
@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_approved_user(request)
    cart = await db.carts.find_one({"user_id": user["_id"]}, {"_id": 0})
    return {"items": cart.get("items", []) if cart else []}

@api_router.post("/cart")
async def add_to_cart(request: Request, item: CartItemRequest):
    user = await get_approved_user(request)
    item_doc = {"item_id": str(uuid.uuid4()), **item.model_dump(), "added_at": datetime.now(timezone.utc).isoformat()}
    await db.carts.update_one({"user_id": user["_id"]}, {"$push": {"items": item_doc}}, upsert=True)
    return {"message": "Added to cart", "item": item_doc}

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(request: Request, item_id: str):
    user = await get_approved_user(request)
    await db.carts.update_one({"user_id": user["_id"]}, {"$pull": {"items": {"item_id": item_id}}})
    return {"message": "Removed from cart"}

@api_router.delete("/cart")
async def clear_cart(request: Request):
    user = await get_approved_user(request)
    await db.carts.delete_one({"user_id": user["_id"]})
    return {"message": "Cart cleared"}

# ──── ENQUIRIES ────
@api_router.post("/enquiries")
async def submit_enquiry(request: Request, req: EnquiryRequest):
    user = await get_approved_user(request)
    cart = await db.carts.find_one({"user_id": user["_id"]}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(400, "Cart is empty")
    enquiry_id = f"ENQ-{random.randint(100000, 999999)}"
    enquiry_doc = {
        "enquiry_id": enquiry_id, "user_id": user["_id"],
        "user_name": user.get("name", ""), "user_email": user.get("email", ""),
        "user_phone": user.get("phone", ""), "items": cart["items"],
        "notes": req.notes, "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.enquiries.insert_one(enquiry_doc)
    await db.carts.delete_one({"user_id": user["_id"]})
    logger.info(f"NEW ENQUIRY [{enquiry_id}] from {user.get('name')} ({user.get('email')}) - {len(cart['items'])} items")
    return {"message": "Enquiry submitted successfully! We will contact you shortly.", "enquiry_id": enquiry_id}

@api_router.get("/enquiries")
async def get_enquiries(request: Request):
    user = await get_approved_user(request)
    enquiries = await db.enquiries.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"enquiries": enquiries}

# ──── FILE UPLOAD ────
@api_router.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    user = await get_approved_user(request)

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"

    filename = f"uploads/{user['_id']}/{uuid.uuid4()}.{ext}"

    data = await file.read()

    import io

    file_url = upload_to_s3(
        io.BytesIO(data),
        filename,
        file.content_type or "application/octet-stream",
    )

    file_doc = {
        "id": str(uuid.uuid4()),
        "storage_path": file_url,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": len(data),
        "user_id": user["_id"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.files.insert_one(file_doc)

    logger.info(f"File uploaded to S3: {file.filename}")

    return {
        "path": file_url,
        "filename": file.filename,
        "size": len(data),
    }

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception:
        raise HTTPException(404, "File not found")

# ──── CUSTOMISATION ────
@api_router.post("/customisation")
async def submit_customisation(request: Request, req: CustomisationRequest):
    user = await get_approved_user(request)
    custom_id = f"CST-{random.randint(100000, 999999)}"
    doc = {
        "custom_id": custom_id, "user_id": user["_id"],
        "user_name": user.get("name", ""), "user_email": user.get("email", ""),
        "user_phone": user.get("phone", ""), **req.model_dump(),
        "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.customisation_requests.insert_one(doc)
    logger.info(f"NEW CUSTOMISATION [{custom_id}] from {user.get('name')}")
    return {"message": "Customisation request submitted successfully!", "custom_id": custom_id}

# ──── CONTACT ────
@api_router.post("/contact")
async def submit_contact(req: ContactRequest):
    doc = {"contact_id": f"CON-{random.randint(100000, 999999)}", **req.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.contacts.insert_one(doc)
    logger.info(f"NEW CONTACT from {req.name} ({req.email})")
    return {"message": "Message sent successfully! We will get back to you soon."}

# ──── ADMIN ────
@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await get_admin_user(request)
    return {
        "total_products": await db.products.count_documents({}),
        "total_retailers": await db.users.count_documents({"role": "retailer"}),
        "pending_approvals": await db.users.count_documents({"role": "retailer", "approved": False}),
        "total_enquiries": await db.enquiries.count_documents({}),
        "total_customisations": await db.customisation_requests.count_documents({}),
    }

@api_router.get("/admin/retailers")
async def admin_get_retailers(request: Request, status: Optional[str] = None):
    await get_admin_user(request)
    query = {"role": "retailer"}
    if status == "pending":
        query["approved"] = False
    elif status == "approved":
        query["approved"] = True
    retailers = []
    async for user in db.users.find(query, {"password_hash": 0}):
        user["_id"] = str(user["_id"])
        retailers.append(user)
    return {"retailers": retailers}

@api_router.put("/admin/retailers/{user_id}/approve")
async def approve_retailer(request: Request, user_id: str):
    await get_admin_user(request)
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"approved": True}})
    if result.modified_count == 0:
        raise HTTPException(404, "Retailer not found")
    logger.info(f"Retailer approved: {user_id}")
    return {"message": "Retailer approved successfully"}

@api_router.put("/admin/retailers/{user_id}/reject")
async def reject_retailer(request: Request, user_id: str):
    await get_admin_user(request)
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"approved": False}})
    if result.modified_count == 0:
        raise HTTPException(404, "Retailer not found")
    return {"message": "Retailer rejected"}

@api_router.get("/admin/products")
async def admin_get_products(request: Request, category: Optional[str] = None, page: int = 1, limit: int = 30):
    await get_admin_user(request)
    query = {"category": category} if category else {}
    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return {"products": products, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

import io

@api_router.post("/admin/products/upload")
async def admin_upload_product(
    request: Request,
    product_id: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...)
):
    await get_admin_user(request)
    logger.info(f"product_id={product_id}")
    logger.info(f"category={category}")

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"

    filename = f"products/{uuid.uuid4()}.{ext}"

    data = await file.read()

    image_url = upload_to_s3(
    io.BytesIO(data),
    filename,
    file.content_type or "application/octet-stream",
)
    logger.info(f"S3 URL = {image_url}")
    existing = await db.products.find_one({"product_id": product_id})

    if existing:
        await db.products.update_one(
        {"product_id": product_id},
        {
            "$push": {"images": image_url},
            "$set": {"category": category}
        }
    )
    else:
        await db.products.insert_one({
        "product_id": product_id,
        "category": category,
        "category_slug": category.lower().replace(" ", "-"),
        "images": [image_url],
        "rating": 5,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    logger.info(f"Product image uploaded: {image_url}")

    return {
    "success": True,
    "message": "Product uploaded successfully",
    "url": image_url,
    "image": image_url,
    "path": image_url
}

@api_router.post("/admin/products")
async def admin_add_product(request: Request, product: ProductCreate):
    await get_admin_user(request)
    existing = await db.products.find_one({"product_id": product.product_id})
    if existing:
        raise HTTPException(400, "Product ID already exists")
    cat = next((c for c in CATEGORIES if c["name"] == product.category), None)
    if not cat:
        raise HTTPException(400, "Invalid category")
    doc = {**product.model_dump(), "category_slug": cat["slug"], "created_at": datetime.now(timezone.utc).isoformat()}
    await db.products.insert_one(doc)
    return {"message": "Product added successfully"}




@api_router.put("/admin/products/{product_id}")
async def admin_update_product(request: Request, product_id: str, update: ProductUpdate):
    await get_admin_user(request)
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "No update data")
    result = await db.products.update_one({"product_id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return {"message": "Product updated"}

@api_router.put("/admin/products/{product_id}/front-image")
async def admin_set_product_front_image(
    request: Request,
    product_id: str,
    image_url: str = Form(...)
):
    await get_admin_user(request)

    product = await db.products.find_one({"product_id": product_id})

    if not product:
        raise HTTPException(404, "Product not found")

    images = product.get("images", [])

    if image_url not in images:
        raise HTTPException(400, "Image does not belong to this product")

    images.remove(image_url)
    images.insert(0, image_url)

    await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"images": images}}
    )

    return {
        "success": True,
        "message": "Front image updated successfully",
        "images": images
    }

@api_router.delete("/admin/products/{product_id}/image")
async def admin_delete_product_image(
    request: Request,
    product_id: str,
    image_url: str = Query(...)
):
    await get_admin_user(request)

    product = await db.products.find_one({"product_id": product_id})

    if not product:
        raise HTTPException(404, "Product not found")

    images = product.get("images", [])

    if image_url not in images:
        raise HTTPException(404, "Image not found for this product")

    # Do not allow deleting the last image
    if len(images) <= 1:
        raise HTTPException(400, "A product must have at least one image")

    images.remove(image_url)

    await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"images": images}}
    )

    return {
        "success": True,
        "message": "Product image deleted successfully",
        "images": images
    }

# REPLACE PRODUCT IMAGE
@api_router.put("/admin/products/{product_id}/replace-image")
async def admin_replace_product_image(
    request: Request,
    product_id: str,
    old_image_url: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...)
):
    await get_admin_user(request)

    product = await db.products.find_one({"product_id": product_id})

    if not product:
        raise HTTPException(404, "Product not found")

    images = product.get("images", [])

    if old_image_url not in images:
        raise HTTPException(
            404,
            "Old image not found for this product"
        )

    # Upload the new image to S3
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"

    filename = f"products/{uuid.uuid4()}.{ext}"

    data = await file.read()

    image_url = upload_to_s3(
        BytesIO(data),
        filename,
        file.content_type or "application/octet-stream"
    )

    # Find the exact position of the old image
    image_index = images.index(old_image_url)

    # Replace old image with new image
    images[image_index] = image_url

    # Save updated image list to MongoDB
    await db.products.update_one(
        {"product_id": product_id},
        {
            "$set": {
                "images": images,
                "category": category
            }
        }
    )

    logger.info(
        f"Product image replaced: "
        f"product_id={product_id}, "
        f"old_image={old_image_url}, "
        f"new_image={image_url}"
    )

    return {
        "success": True,
        "message": "Product image replaced successfully",
        "images": images,
        "image": image_url
    }

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(request: Request, product_id: str):
    await get_admin_user(request)
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"message": "Product deleted"}

@api_router.get("/admin/enquiries")
async def admin_get_enquiries(request: Request):
    await get_admin_user(request)
    enquiries = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"enquiries": enquiries}

@api_router.get("/admin/customisations")
async def admin_get_customisations(request: Request):
    await get_admin_user(request)
    customs = await db.customisation_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"customisations": customs}

@api_router.get("/admin/whatsapp-orders")
async def admin_get_whatsapp_orders(request: Request):
    await get_admin_user(request)

    orders = await whatsapp_orders.find(
        {},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(1000)

    return {
        "orders": orders
    }


@api_router.get("/admin/whatsapp-orders/{order_id}")
async def admin_get_whatsapp_order(
    order_id: str,
    request: Request
):
    await get_admin_user(request)

    order = await whatsapp_orders.find_one(
    {"orderId": order_id},
    {"_id": 0}
)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order

@api_router.get("/admin/whatsapp-orders/{order_id}/excel")
async def download_whatsapp_order_excel(
    order_id: str,
    request: Request
):
    await get_admin_user(request)

    order = await whatsapp_orders.find_one(
        {"orderId": order_id},
        {"_id": 0}
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Order Details"

    # Header
    ws["A1"] = "Field"
    ws["B1"] = "Value"

    ws["A1"].font = Font(bold=True)
    ws["B1"].font = Font(bold=True)

    # Fields to exclude
    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    row = 2

    for key, value in order.items():
        if key in excluded_fields:
            continue

        ws.cell(row=row, column=1).value = key.replace("_", " ").title()
        ws.cell(row=row, column=2).value = str(value) if value is not None else ""
        row += 1

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{order_id}.xlsx"'
        },
    )
@api_router.get("/admin/whatsapp-orders/excel/today")
async def download_today_orders_excel(request: Request):
    await get_admin_user(request)

    from datetime import datetime

    today = datetime.now().strftime("%Y-%m-%d")

    orders = await whatsapp_orders.find(
        {"order_date": today},
        {"_id": 0}
    ).to_list(None)

    wb = Workbook()
    ws = wb.active
    ws.title = "Today's Orders"

    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    if orders:

        headers = [
            key
            for key in orders[0].keys()
            if key not in excluded_fields
        ]

        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col)
            cell.value = header.replace("_", " ").title()
            cell.font = Font(bold=True)

        for row_index, order in enumerate(orders, start=2):

            for col, header in enumerate(headers, start=1):

                ws.cell(
                    row=row_index,
                    column=col
                ).value = str(order.get(header, ""))

    output = BytesIO()

    wb.save(output)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            f'attachment; filename="Today_Orders_{today}.xlsx"'
        },
    )

@api_router.get("/admin/whatsapp-orders/excel/date/{selected_date}")
async def download_orders_by_date(
    selected_date: str,
    request: Request
):
    await get_admin_user(request)

    orders = await whatsapp_orders.find(
        {"order_date": selected_date},
        {"_id": 0}
    ).to_list(length=None)

    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No orders found for this date."
        )

    wb = Workbook()
    ws = wb.active
    ws.title = f"Orders {selected_date}"

    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    headers = [
        key for key in orders[0].keys()
        if key not in excluded_fields
    ]

    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col)
        cell.value = header.replace("_", " ").title()
        cell.font = Font(bold=True)

    for row_index, order in enumerate(orders, start=2):
        for col, header in enumerate(headers, start=1):
            ws.cell(
                row=row_index,
                column=col
            ).value = str(order.get(header, ""))

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            f'attachment; filename="Orders_{selected_date}.xlsx"'
        },
    )


@api_router.get("/admin/whatsapp-orders/excel/customer/{customer_name}")
async def download_orders_by_customer(
    customer_name: str,
    request: Request
):
    await get_admin_user(request)

    orders = await whatsapp_orders.find(
        {
            "customer_name": {
                "$regex": f"^{customer_name}$",
                "$options": "i"
            }
        },
        {"_id": 0}
    ).to_list(length=None)

    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No orders found for this customer."
        )

    wb = Workbook()
    ws = wb.active
    ws.title = customer_name

    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    headers = [
        key for key in orders[0].keys()
        if key not in excluded_fields
    ]

    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col)
        cell.value = header.replace("_", " ").title()
        cell.font = Font(bold=True)

    for row_index, order in enumerate(orders, start=2):
        for col, header in enumerate(headers, start=1):
            ws.cell(
                row=row_index,
                column=col
            ).value = str(order.get(header, ""))

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            f'attachment; filename="{customer_name}_Orders.xlsx"'
        },
    )


@api_router.get("/admin/whatsapp-orders/excel/customer-date")
async def download_orders_by_customer_and_date(
    customer_name: str,
    order_date: str,
    request: Request
):
    await get_admin_user(request)

    orders = await whatsapp_orders.find(
        {
            "customer_name": {
                "$regex": f"^{customer_name}$",
                "$options": "i"
            },
            "order_date": order_date
        },
        {"_id": 0}
    ).to_list(length=None)

    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No matching orders found."
        )

    wb = Workbook()
    ws = wb.active
    ws.title = customer_name[:31]

    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    headers = [
        key
        for key in orders[0].keys()
        if key not in excluded_fields
    ]

    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col)
        cell.value = header.replace("_", " ").title()
        cell.font = Font(bold=True)

    for row_index, order in enumerate(orders, start=2):
        for col, header in enumerate(headers, start=1):
            ws.cell(
                row=row_index,
                column=col
            ).value = str(order.get(header, ""))

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            f'attachment; filename="{customer_name}_{order_date}.xlsx"'
        },
    )

@api_router.get("/admin/whatsapp-orders/excel/date-range")
async def download_orders_by_date_range(
    from_date: str,
    to_date: str,
    request: Request
):
    await get_admin_user(request)

    orders = await whatsapp_orders.find(
        {
            "order_date": {
                "$gte": from_date,
                "$lte": to_date
            }
        },
        {"_id": 0}
    ).sort("order_date", 1).to_list(length=None)

    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No orders found for the selected date range."
        )

    wb = Workbook()
    ws = wb.active
    ws.title = "Orders"

    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    headers = [
        key
        for key in orders[0].keys()
        if key not in excluded_fields
    ]

    # Header row
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col)
        cell.value = header.replace("_", " ").title()
        cell.font = Font(bold=True)

    # Order rows
    for row_index, order in enumerate(orders, start=2):
        for col, header in enumerate(headers, start=1):
            ws.cell(
                row=row_index,
                column=col
            ).value = str(order.get(header, ""))

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            f'attachment; filename="Orders_{from_date}_to_{to_date}.xlsx"'
        },
    )

@api_router.get("/admin/whatsapp-orders/excel/customers-date")
async def download_orders_by_customers_and_date(
    request: Request,
    customer_names: List[str] = Query(...),
    order_date: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    await get_admin_user(request)

    # Validate customers
    if not customer_names:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one customer."
        )

    # Clean customer names
    cleaned_customer_names = []

    for name in customer_names:
        if not name:
            continue

        for customer in name.split(","):
            customer = customer.strip()

            if customer:
                cleaned_customer_names.append(customer)

    customer_names = list(dict.fromkeys(cleaned_customer_names))

    if not customer_names:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one customer."
        )

    # Validate date selection
    if order_date:
        date_query = {
            "order_date": order_date
        }

    elif from_date and to_date:
        if from_date > to_date:
            raise HTTPException(
                status_code=400,
                detail="From date cannot be after To date."
            )

        date_query = {
            "order_date": {
                "$gte": from_date,
                "$lte": to_date
            }
        }

    else:
        raise HTTPException(
            status_code=400,
            detail="Please select a date or a date range."
        )

    # Match selected customers
    customer_query = {
        "$or": [
            {
                "customer_name": {
                    "$regex": f"^\\s*{re.escape(name)}\\s*$",
                    "$options": "i"
                }
            }
            for name in customer_names
        ]
    }

    # Combine customer + date filters
    query = {
        **customer_query,
        **date_query
    }

    # Get matching orders
    orders = await whatsapp_orders.find(
        query,
        {"_id": 0}
    ).sort(
        "order_date", 1
    ).to_list(length=None)

    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No matching orders found."
        )

    # Create Excel
    wb = Workbook()
    ws = wb.active
    ws.title = "Orders"

    excluded_fields = {
        "design_images",
        "reference_video",
        "flow_token"
    }

    headers = [
        key
        for key in orders[0].keys()
        if key not in excluded_fields
    ]

    # Header row
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col)
        cell.value = header.replace("_", " ").title()
        cell.font = Font(bold=True)

    # Order rows
    for row_index, order in enumerate(orders, start=2):
        for col, header in enumerate(headers, start=1):
            ws.cell(
                row=row_index,
                column=col
            ).value = str(order.get(header, ""))

    # Create Excel file
    output = BytesIO()
    wb.save(output)
    output.seek(0)

    # Filename
    if order_date:
        filename = f"Orders_{order_date}.xlsx"
    else:
        filename = f"Orders_{from_date}_to_{to_date}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


# ===============================
# GET ALL CUSTOMER NAMES (NEW API)
# ===============================

@app.get("/admin/whatsapp-orders/customers")
async def get_all_customers():
    try:
        customers = await whatsapp_orders.distinct("customer_name")
        customers = [c for c in customers if c]

        return {
            "success": True,
            "customers": customers
        }

    except Exception as e:
        print("Error fetching customers:", str(e))
        return {
            "success": False,
            "customers": []
        }
# @api_router.put("/admin/whatsapp-orders/{order_id}")
# async def update_whatsapp_order(
#     order_id: str,
#     request: Request,
#     data: dict
# ):
#     await get_admin_user(request)

#     result = await whatsapp_orders.update_one(
#         {"orderId": order_id},
#         {
#             "$set": {
#                 "status": data.get("status"),
#                 "priority": data.get("priority"),
#                 "assignedTo": data.get("assignedTo"),
#                 "adminNotes": data.get("adminNotes"),
#             }
#         }
#     )

#     if result.matched_count == 0:
#         raise HTTPException(status_code=404, detail="Order not found")

#     order = await whatsapp_orders.find_one(
#         {"orderId": order_id},
#         {"_id": 0}
#     )

#     return order


@api_router.put("/admin/whatsapp-orders/{order_id}")
async def admin_update_whatsapp_order(
    order_id: str,
    update: WhatsAppOrderUpdate,
    request: Request
):
    await get_admin_user(request)

    update_data = {
        key: value
        for key, value in update.model_dump().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No data to update."
        )

    update_data["updatedAt"] = datetime.now(timezone.utc)

    result = await whatsapp_orders.update_one(
        {"orderId": order_id},
        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    return {
        "message": "Order updated successfully."
    }

from cloudinary.uploader import destroy

@api_router.delete("/admin/whatsapp-orders/{order_id}")
async def admin_delete_whatsapp_order(
    order_id: str,
    request: Request
):
    await get_admin_user(request)

    order = await whatsapp_orders.find_one(
        {"orderId": order_id}
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Delete design images
    for image in order.get("design_images", []):

        try:

            public_id = image.split("/upload/")[1]
            public_id = public_id.split("/", 1)[1]
            public_id = public_id.rsplit(".", 1)[0]

            print("Deleting Cloudinary image:", public_id)

            destroy(public_id)

        except Exception as e:
            print("Image delete failed:", e)

    # Delete reference video
    if order.get("reference_video"):

        try:

            public_id = order["reference_video"].split("/upload/")[1]
            public_id = public_id.split("/", 1)[1]
            public_id = public_id.rsplit(".", 1)[0]

            print("Deleting Cloudinary video:", public_id)

            destroy(
                public_id,
                resource_type="video"
            )

        except Exception as e:
            print("Video delete failed:", e)

    await whatsapp_orders.delete_one(
        {"orderId": order_id}
    )

    return {
        "success": True
    }



# ──── SEEDING ────
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

    existing = await db.users.find_one({"email": admin_email})

    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")

    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Admin password updated")

    


    # ✅ SAFE MEMORY DIRECTORY FIX
    try:
        os.makedirs("memory", exist_ok=True)

        with open("memory/test_credentials.md", "w") as f:
            f.write(f"# Test Credentials\n\n")
            f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
            f.write("## Auth Endpoints\n")
            f.write("- POST /api/auth/register\n")
            f.write("- POST /api/auth/login\n")
            f.write("- GET /api/auth/me\n")

    except Exception as e:
        logger.warning(f"Memory folder skipped: {e}")
        

async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        logger.info(f"Products already exist ({count})")
        return
    products = []
    for cat in CATEGORIES:
        images = STOCK_IMAGES.get(cat["name"], ["https://images.unsplash.com/photo-1587947330318-88fcd9055420?w=500"])
        for i in range(30):
            pid = f"{cat['prefix']}-{random.randint(100000, 999999)}"
            img = images[i % len(images)]
            products.append({
                "product_id": pid, "category": cat["name"], "category_slug": cat["slug"],
                "images": [img, img, img], "rating": 5.0,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    await db.products.insert_many(products)
    logger.info(f"Seeded {len(products)} products")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    logger.info("AWS S3 storage initialized")
    await seed_admin()
    await seed_products()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()

@app.on_event("shutdown")
async def shutdown():
    client.close()


@app.get("/webhook")
async def verify_webhook(request: Request):

    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if (
        mode == "subscribe"
        and token == os.getenv("VERIFY_TOKEN")
    ):
        print("✅ Webhook Verified")
        return PlainTextResponse(content=challenge)

    return PlainTextResponse(
        content="Verification Failed",
        status_code=403
    )


@app.post("/webhook")
async def whatsapp_webhook(request: Request):

    body = await request.json()

    print("========== NEW WEBHOOK ==========")
    print(body)
    print("=================================")

    try:


        value = (
            body.get("entry", [{}])[0]
            .get("changes", [{}])[0]
            .get("value", {})
        )

        print("VALUE KEYS:", list(value.keys()))
        print(value)

        messages = value.get("messages", [])

        print("MESSAGES:", messages)

        if not messages:
            return {"success": True}

        message = messages[0]

        if message:

            print("Message Type:", message.get("type"))

            # ==========================
            # VIDEO MESSAGE
            # ==========================

            if message.get("type") == "video":

                print("========== VIDEO RECEIVED ==========")

                sender = message["from"]

                if sender not in pending_video_uploads:
                    send_text_message(
                        sender,
                        "No pending order found for this video."
                    )
                    return {"success": True}

                order_id = pending_video_uploads[sender]

                video_id = message["video"]["id"]

                print("Uploading video:", video_id)

                uploaded = upload_whatsapp_video(video_id)

                result = await whatsapp_orders.update_one(
                    {"orderId": order_id},
                    {
                        "$set": {
                            "reference_video": uploaded["secure_url"]
                        }
                    }
                )

                print("ORDER ID:", order_id)
                print("VIDEO URL:", uploaded["secure_url"])
                print("MATCHED:", result.matched_count)
                print("MODIFIED:", result.modified_count)

                doc = await whatsapp_orders.find_one(
                    {"orderId": order_id},
                    {"_id": 0}
                )

                print("UPDATED DOC:")
                print(doc)

                del pending_video_uploads[sender]

                timer = video_upload_timers.pop(sender, None)

                if timer:
                    timer.cancel()

                video_waiting_users.pop(sender, None)
                pending_video_uploads.pop(sender, None)

                send_text_message(
                    sender,
                    "✅ Reference video received successfully."
                )

                return {"success": True}

            if message.get("type") == "text":

                text = (
                    message.get("text", {})
                    .get("body", "")
                    .lower()
                    .strip()
                )

                sender = message["from"]

                print("Message:", text)

                # Start Flow
                if text == "hi":
                    send_flow(sender)
                    return {"success": True}

                # Customer wants to upload video
                if text == "yes":

                    if sender not in pending_video_uploads:
                        send_text_message(
                            sender,
                            "No recent order found."
                        )
                        return {"success": True}

                    # from datetime import datetime, timedelta

                    video_waiting_users[sender] = (
                        datetime.utcnow() + timedelta(minutes=10)
                    )

                    timer = threading.Timer(
                        VIDEO_TIMEOUT,
                        video_upload_timeout,
                        args=[sender]
                    )

                    timer.start()
                    video_upload_timers[sender] = timer

                    # # START TIMER
                    # timer = threading.Timer(
                    #     VIDEO_TIMEOUT,
                    #     video_upload_timeout,
                    #     args=[sender]
                    # )

                    # timer.start()
                    # video_upload_timers[sender] = timer

                    send_text_message(
                        sender,
                        """🎥 Great!

            Please upload ONE reference video.
            Maximum size: 40 MB.

            You have 10 minutes."""
                    )

                    return {"success": True}

                # Customer doesn't want to upload video
                if text == "no":

                    timer = video_upload_timers.pop(sender, None)  

                    if timer:
                        timer.cancel()
                    pending_video_uploads.pop(sender, None)
                
                    video_waiting_users.pop(sender, None)
                
                    send_text_message(
                        sender,
                        """✅ Thank you!

            Your order has been submitted successfully.

            Our team will contact you if any clarification is required."""
                )

                return {"success": True}
                    

                    
                    

                

            elif (
                message.get("type") == "interactive"
                and message["interactive"].get("type") == "nfm_reply"
            ):

                import json

                form_data = json.loads(
                    message["interactive"]["nfm_reply"]["response_json"]
                )

                print("========== FORM DATA ==========")

                for key, value in form_data.items():
                    print(f"{key}: {value}")

                print("===============================")


                cloudinary_images = []

                for image in form_data.get("design_images", []):

                    print("Uploading:", image["id"])

                    uploaded = upload_whatsapp_image(image["id"])

                    cloudinary_images.append(uploaded["secure_url"])

                order = form_data.copy()
                order["design_images"] = cloudinary_images
                order["orderId"] = await get_next_order_id()
                order["status"] = "New"
                order["priority"] = "Normal"
                order["assignedTo"] = ""
                order["adminNotes"] = ""
                order["createdAt"] = datetime.utcnow()

                print("BEFORE INSERT")

                result = await whatsapp_orders.insert_one(order)

                print("AFTER INSERT")
                print(result.inserted_id)

                count = await whatsapp_orders.count_documents({})
                print("TOTAL ORDERS:", count)

                pending_video_uploads[message["from"]] = order["orderId"]
                # Remember this customer's latest order so the next video can be attached
                send_text_message(
                    message["from"],
                    f"""✅ Thank you for your order!

                Your Order ID: {order["orderId"]}

                Would you like to upload a reference video?

                Reply with:

                YES
                or
                NO"""
                )

                # print("Send message response:", response)

        return {"success": True}

    except Exception as e:
        print(e)
        return {"success": False}
    

@app.post("/whatsapp/flow")
async def whatsapp_flow_endpoint(request: Request):

    body = await request.json()

    print("========== ENCRYPTED FLOW ==========")
    print(body)
    print("====================================")

    try:
        print("STEP 1")

        data, aes_key, iv = decrypt_request(body)

        print("STEP 2")

        print("Decrypted request:")
        print(data)

        action = data.get("action")

        if action == "ping":

            response = {
                "version": "3.0",
                 "data": {
                    "status": "active"
                }
            }
            
        elif action == "INIT":

            response = {
                "version": "3.0",
                "screen": "JEWELLERY_ORDER",
                "data": {}
             }
            

            action = data.get("action")

        if action == "ping":

            response = {
                "version": "3.0",
                "data": {
                    "status": "active"
                }
            }

        elif action == "INIT":

            response = {
                "version": "3.0",
                "screen": "JEWELLERY_ORDER",
                "data": {}
            }

        elif action == "BACK":

            response = {
                "version": "3.0",
                "screen": data.get("screen"),
                "data": {}
            }

        elif action == "data_exchange":

            response = {
                "version": "3.0",
                "screen": "SUCCESS",
                "data": {}
            }

        else:

            response = {
                "version": "3.0",
                "data": {
                    "status": "active"
                }
            }

        encrypted = encrypt_response(response, aes_key, iv)

        return Response(
            content=encrypted,
            media_type="text/plain"
        )
    
    except Exception as e:
        import traceback

        print("FLOW ERROR")
        traceback.print_exc()

        return {"error": str(e)}