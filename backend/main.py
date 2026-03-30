from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import urllib.request
import psycopg2
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCATFph6lz3DalWZMdA5wqGjnzBLDR5i-M")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
)

app = FastAPI(title="MarketNest AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ────────────────────────────────────────────────────────────────────
def get_db():
    try:
        return psycopg2.connect(os.getenv("DATABASE_URL"))
    except Exception:
        return None

def get_buyer_orders(user_id: int):
    try:
        conn = get_db()
        if not conn:
            return []
        cur = conn.cursor()
        cur.execute(
            "SELECT id, status, total_amount, created_at, tracking_id "
            "FROM orders WHERE buyer_id = %s ORDER BY created_at DESC LIMIT 5",
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception:
        return []

# ── Models ──────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_id: Optional[int] = None

class SearchRequest(BaseModel):
    query: str

# ── System Prompt ───────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Nesty, the friendly AI support assistant for MarketNest — Pakistan's trusted online marketplace.

Help users with: orders, returns, delivery, payments, contacting sellers, coupons, account issues, and how to shop or sell.

Key platform facts:
- Standard delivery: Rs.150, 3-5 business days. Express: Rs.300, 1-2 days.
- Free shipping on orders above Rs.2,000
- Return window: 7 days from delivery (unused, original packaging)
- Refunds processed in 5-7 business days
- Payment: Credit/Debit Card (Visa, Mastercard), Digital Wallet
- Cancel orders before shipping only
- Support: support@marketnest.com | Mon-Sat 9am-6pm PKT
- Sellers can create coupons from Seller Dashboard → Coupons
- Buyers apply coupons in the Cart page before checkout

Guidelines:
- Be warm, concise, and helpful
- Use **bold** for important info
- Keep responses under 200 words
- If you cannot resolve an issue, direct to support@marketnest.com
- Respond in the same language the user writes in (Urdu or English)
- Never make up order details — only reference real data if provided"""

# ── Gemini Call ─────────────────────────────────────────────────────────────────
def call_gemini(message: str, history: List[ChatMessage], order_context: str = "") -> str:
    system = SYSTEM_PROMPT
    if order_context:
        system += f"\n\nUser's recent orders:\n{order_context}"

    contents = []
    for msg in (history or [])[-8:]:
        role = "user" if msg.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg.content}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = json.dumps({
        "system_instruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 400,
            "topP": 0.9,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT",  "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        GEMINI_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if "candidates" in data and data["candidates"]:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    elif "error" in data:
        raise Exception(data["error"].get("message", "Gemini API error"))
    else:
        raise Exception("Empty response from Gemini")

# ── Routes ──────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "MarketNest AI (Gemini-powered)", "status": "ok"}

@app.post("/chat")
async def ai_chat(payload: ChatRequest):
    try:
        order_context = ""
        if payload.user_id:
            orders = get_buyer_orders(payload.user_id)
            if orders:
                status_emoji = {
                    "pending": "⏳", "confirmed": "✅", "packed": "📦",
                    "shipped": "🚚", "delivered": "🎉", "cancelled": "❌"
                }
                lines = []
                for o in orders:
                    emoji = status_emoji.get(str(o[1]).lower(), "📦")
                    line = f"- Order #{o[0]}: {emoji} {o[1]}, Rs.{o[2]}, {str(o[3])[:10]}"
                    if o[4]:
                        line += f", Tracking: {o[4]}"
                    lines.append(line)
                order_context = "\n".join(lines)

        reply = call_gemini(payload.message, payload.history or [], order_context)
        return {"reply": reply, "status": "success"}

    except Exception as e:
        return {
            "reply": (
                "Sorry, I'm having a little trouble right now 😅\n\n"
                "Please try again or email **support@marketnest.com** for help."
            ),
            "status": "error",
            "detail": str(e)
        }

@app.post("/search/suggestions")
async def search_suggestions(payload: SearchRequest):
    try:
        conn = get_db()
        if not conn:
            return {"suggestions": []}
        cur = conn.cursor()
        cur.execute(
            "SELECT DISTINCT name, category FROM products "
            "WHERE is_approved = TRUE AND is_active = TRUE "
            "AND (name ILIKE %s OR category ILIKE %s) LIMIT 6",
            (f"%{payload.query}%", f"%{payload.query}%")
        )
        results = cur.fetchall()
        cur.close()
        conn.close()
        return {"suggestions": [{"text": r[0], "type": "product"} for r in results]}
    except Exception:
        return {"suggestions": []}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "MarketNest AI (Gemini)"}
