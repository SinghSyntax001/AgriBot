# llm_utils.py (using Groq SDK)
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY missing in .env")

# Initialize client
client = Groq(api_key=GROQ_API_KEY)

# =====================
# 🧠 Chat Completion
# =====================
def groq_chat(messages, model="llama-3.1-8b-instant", temperature=0.2):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=512,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"LLM Error: {e}"


# =====================
# 🎙️ Speech-to-Text
# =====================
def groq_whisper_transcribe(audio_file):
    try:
        response = client.audio.transcriptions.create(
            file=(audio_file.filename, audio_file.stream),
            model="whisper-large-v3-turbo",
            response_format="json",
        )
        return response.text.strip()
    except Exception as e:
        return f"Whisper Error: {e}"
