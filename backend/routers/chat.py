from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import httpx

from backend.utils.auth import get_current_user

chat_router = APIRouter()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are ARIA (Anomalyze Response Intelligence Assistant), an AI security assistant built into the Anomalyze cyber threat detection system. You help security admins and analysts understand threats, investigate alerts, and make decisions.

About Anomalyze:
- AI-powered Security Operations Center (SOC) dashboard
- Built with FastAPI backend + React 18 frontend
- Uses IsolationForest + RandomForest ML ensemble for threat detection
- Rule engine detects: SSH Brute Force, SQL Injection, Path Traversal, Port Scan, XSS, DoS, Credential Stuffing
- WebSocket real-time broadcasting to browser
- JWT authentication with ADMIN and ANALYST roles
- Automated IP blocking via iptables/netsh on HIGH severity alerts
- Gmail SMTP email notifications on HIGH alerts
- MITRE ATT&CK framework mapping for every alert type
- SQLite database with log_entries, alerts, users, response_actions tables
- DEV_MODE synthetic log generator for testing

Access levels:
- If live system data is provided in the user message, the user is authenticated (ADMIN/ANALYST). Give them full system insights, alert counts, threat analysis, and actionable recommendations based on the live data.
- If no live system data is provided, the user is a public visitor or unauthenticated. Give only general cybersecurity education. Never mention internal system data or make up alert counts.

Your personality:
- Professional but approachable
- Concise — keep responses short and actionable
- Use bullet points for lists
- Use technical terminology correctly
- Never make up alert data — only use what is provided
- When asked about live data, reference the stats provided
- For cybersecurity questions, give accurate educational answers
- Always end investigation advice with a clear recommended action

Format responses in clean markdown. Keep answers under 200 words unless the question genuinely needs more detail."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


async def call_groq(messages: list) -> str:
    from backend.config import settings  # inside function so .env is loaded first
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    payload = {
        "model": "llama-3.1-8b-instant",
        "max_tokens": 1000,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages,
        ],
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Groq API error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Could not reach Groq API: {str(e)}"
            )

    data = response.json()
    return data["choices"][0]["message"]["content"]


@chat_router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user=Depends(get_current_user),
):
    messages = [m.dict() for m in body.messages]
    reply = await call_groq(messages)
    return ChatResponse(reply=reply)


@chat_router.post("/chat/public")
async def chat_public(body: ChatRequest):
    clean_messages = []
    for m in body.messages:
        content = m.content
        if "[LIVE CONTEXT" in content:
            content = content.split("[LIVE CONTEXT")[0].strip()
        clean_messages.append({"role": m.role, "content": content})

    reply = await call_groq(clean_messages)
    return {"reply": reply}