# app.py
from flask import Flask, request, jsonify, render_template
from llm_utils import groq_chat, groq_whisper_transcribe
from vectordb_utils import retrieve_context, add_to_vectordb

app = Flask(__name__, static_folder="static", template_folder="templates")


@app.route('/')
def index():
    return render_template('index.html')


# =====================
# 🧠 Chat Endpoint
# =====================
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True)
        query = data.get("query", "").strip()
        lang = data.get("lang", "en")

        if not query:
            return jsonify({"error": "Empty query"}), 400

        context = retrieve_context(query)
        system_msg = {
            "role": "system",
            "content": (
                "You are AgriBot, an expert farming assistant for Indian farmers. "
                "Provide short, practical, low-cost advice in simple language."
            )
        }
        user_msg = {
            "role": "user",
            "content": f"Question: {query}\n\nContext:\n{context}"
        }
        answer = groq_chat([system_msg, user_msg])
        return jsonify({"answer": answer, "context": context})

    except Exception as e:
        import traceback
        print("❌ Chat error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# =====================
# 🎙️ Speech-to-Text Endpoint
# =====================
@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file uploaded'}), 400

    try:
        audio_file = request.files['audio']
        transcript = groq_whisper_transcribe(audio_file)
        return jsonify({"text": transcript})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================
# 📘 Ingest Documents
# =====================
@app.route('/api/ingest', methods=['POST'])
def ingest():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()
    source = data.get("source", "manual")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    chunks = add_to_vectordb(text, source)
    return jsonify({"status": "ok", "chunks": chunks})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
