from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import bcrypt
import jwt
import uuid
import random
import requests as http_requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from bson import ObjectId

# ──── OBJECT STORAGE ────
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "shree-mother-b2b"
_storage_key = None

def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = http_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = http_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-change-me')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ──── CONSTANTS ────
CATEGORIES = [
    {"name": "Bali", "prefix": "BL", "slug": "bali"},
    {"name": "Bangle", "prefix": "BG", "slug": "bangle"},
    {"name": "Kada", "prefix": "KD", "slug": "kada"},
    {"name": "Bracelet", "prefix": "BR", "slug": "bracelet"},
    {"name": "Chains", "prefix": "CH", "slug": "chains"},
    {"name": "Cufflinks", "prefix": "CL", "slug": "cufflinks"},
    {"name": "Earrings", "prefix": "ER", "slug": "earrings"},
    {"name": "Hath Pan", "prefix": "HP", "slug": "hath-pan"},
    {"name": "Maang Tikka", "prefix": "MT", "slug": "maang-tikka"},
    {"name": "Mangal Sutra", "prefix": "MS", "slug": "mangal-sutra"},
    {"name": "Necklace", "prefix": "NK", "slug": "necklace"},
    {"name": "Nose Pin", "prefix": "NP", "slug": "nose-pin"},
    {"name": "Pendant", "prefix": "PN", "slug": "pendant"},
    {"name": "Rings", "prefix": "RN", "slug": "rings"},
    {"name": "Tops", "prefix": "TP", "slug": "tops"},
    {"name": "Watchbelts", "prefix": "WB", "slug": "watchbelts"},
]

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
    location: str

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

# ──── AUTH ENDPOINTS ────
@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_doc = {
        "name": req.name, "email": email,
        "password_hash": hash_password(req.password),
        "business_name": req.business_name, "gst_number": req.gst_number,
        "phone": req.phone, "location": req.location,
        "role": "retailer", "approved": False,
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
        query["category"] = category
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
    path = f"{APP_NAME}/uploads/{user['_id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    file_doc = {
        "id": str(uuid.uuid4()), "storage_path": result["path"],
        "original_filename": file.filename, "content_type": file.content_type,
        "size": result.get("size", len(data)), "user_id": user["_id"],
        "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.files.insert_one(file_doc)
    logger.info(f"File uploaded: {file.filename} by {user.get('name')}")
    return {"path": result["path"], "filename": file.filename, "size": file_doc["size"]}

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

@api_router.post("/admin/products/upload")
async def admin_upload_product_image(request: Request, product_id: str = Form(...), category: str = Form(...), file: UploadFile = File(...)):
    await get_admin_user(request)
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/products/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    file_url = f"/api/files/{result['path']}"
    existing = await db.products.find_one({"product_id": product_id})
    if existing:
        await db.products.update_one({"product_id": product_id}, {"$push": {"images": file_url}})
        updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
        return {"message": f"Image added to {product_id}", "image_url": file_url, "product": updated}
    else:
        cat = next((c for c in CATEGORIES if c["name"] == category), None)
        if not cat:
            raise HTTPException(400, "Invalid category")
        doc = {
            "product_id": product_id, "category": category, "category_slug": cat["slug"],
            "images": [file_url], "rating": 5.0, "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.products.insert_one(doc)
        return {"message": f"Product {product_id} created", "image_url": file_url, "product": {k: v for k, v in doc.items() if k != "_id"}}


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

# ──── SEEDING ────
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin", "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- GET /api/auth/me\n")

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
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init deferred: {e}")
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
