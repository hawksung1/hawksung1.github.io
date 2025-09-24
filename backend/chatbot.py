from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

load_dotenv("config.env")

app = FastAPI()

BOT_NAME = os.getenv("BOT_NAME", "Chatbot")
WELCOME_MESSAGE = os.getenv("WELCOME_MESSAGE", "Hello!")

@app.get("/api/welcome")
def welcome():
    return {"bot_name": BOT_NAME, "message": WELCOME_MESSAGE}

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    # Simple echo logic
    response = f"{BOT_NAME}: You said '{user_message}'"
    return JSONResponse({"response": response})

# Moved to backend/
