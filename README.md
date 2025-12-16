# 🌾 AgriBot – AI-Powered Agricultural Assistant (LLM + RAG)

AgriBot is a **Generative AI–based chatbot for farmers** that provides practical, low-cost agricultural advice using **Large Language Models (LLMs)** and **Retrieval-Augmented Generation (RAG)**.
Farmers can interact using **text or voice (Hindi & English)** to get solutions related to crops, pests, diseases, fertilizers, and farming practices.

---

## 🚀 Features

* 🧠 **LLM-powered chatbot** using LLaMA (via Groq Cloud)
* 🔍 **Retrieval-Augmented Generation (RAG)** with ChromaDB
* 📚 **Semantic search** using sentence embeddings
* 🎙️ **Speech-to-Text (STT)** using Whisper
* 🌐 **Bilingual support** (English & Hindi)
* 🧑‍🌾 Designed specifically for **Indian farmers**
* 🔐 Firebase Authentication (Login / Signup)
* 🕒 Chat history stored in Firestore
* 💻 Web-based UI (HTML, CSS, JavaScript)
* ⚡ Fully free/open-source stack

---

## 🏗️ System Architecture

```
Farmer (Text / Voice)
        |
        v
   Speech-to-Text (Whisper)
        |
        v
     User Query
        |
        v
Embedding Model (MiniLM)
        |
        v
   Vector Database (ChromaDB)
        |
   Relevant Context Retrieved
        |
        v
   LLM (LLaMA 3.1)
        |
        v
   Final Answer to Farmer
```

---

## 🧠 Core Technologies Used

| Component      | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | HTML, CSS, JavaScript                   |
| Backend        | Python, Flask                           |
| LLM            | LLaMA 3.1 (Groq Cloud)                  |
| Embeddings     | SentenceTransformers (all-MiniLM-L6-v2) |
| Vector DB      | ChromaDB                                |
| STT            | Whisper (Groq Cloud)                    |
| Authentication | Firebase Auth                           |
| Database       | Firebase Firestore                      |
| Hosting        | Local / Can be deployed                 |

---

## 🔍 How RAG Works in AgriBot

1. User asks a question (text or voice)
2. Query is converted into **embeddings**
3. Embeddings are matched with stored agricultural knowledge in **ChromaDB**
4. Most relevant documents are retrieved using **cosine similarity**
5. Retrieved context is passed to the **LLM**
6. LLM generates a grounded, low-hallucination response

---

## 📊 Evaluation Metrics

Since this project uses **pre-trained models**, evaluation is done using **GenAI-specific metrics**:

### 1️⃣ Binary Evaluation

* Correct answer → 1
* Incorrect / irrelevant → 0

### 2️⃣ Graded Evaluation (1–5 scale)

| Score | Meaning                  |
| ----- | ------------------------ |
| 5     | Fully correct & detailed |
| 4     | Mostly correct           |
| 3     | Partially correct        |
| 2     | Generic / weak           |
| 1     | Incorrect                |

### 3️⃣ Additional Metrics

* **Whisper** → Word Error Rate (WER)
* **Retrieval** → Recall@k
* **Similarity** → Cosine similarity

---

## 📁 Project Structure

```
AgriBot/
│
├── app.py                  # Flask backend
├── llm_utils.py             # LLaMA & Whisper logic
├── vectordb_utils.py        # ChromaDB + embeddings
│
├── templates/
│   └── index.html           # Main UI
│
├── static/
│   ├── style.css            # Styling
│   └── app.js               # Frontend logic
│
├── chroma_db/               # Vector database (auto-generated)
├── requirements.txt
└── README.md
```

---

## ▶️ How to Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/SinghSyntax001/AgriBot.git
cd AgriBot
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv env
env\Scripts\activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Set Environment Variables

Create `.env` file:

```
GROQ_API_KEY=your_groq_api_key
```

### 5️⃣ Run the App

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000
```

---

## 🎯 Use Cases

* Pest management advice
* Fertilizer recommendations
* Organic farming guidance
* Quick agricultural FAQs
* Farmer education & awareness

---

## 🧑‍💻 Contributors

* **Shashank Singh**
* **Pallav Prakash**


