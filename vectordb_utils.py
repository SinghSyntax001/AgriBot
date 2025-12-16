# vectordb_utils.py
import chromadb
from sentence_transformers import SentenceTransformer

# 🧠 Initialize Chroma client (modern syntax, persistent local DB)
client = chromadb.PersistentClient(path="./chroma_db")

# Try to get or create the collection
try:
    collection = client.get_collection("agri_knowledge")
except:
    collection = client.create_collection("agri_knowledge")

# Free open-source embedding model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")


# =====================
# 🔍 Embed & Retrieve
# =====================
def embed_texts(texts: list[str]):
    """Generate embeddings for a list of texts."""
    return embed_model.encode(texts).tolist()


def retrieve_context(query: str, top_k=4):
    """Retrieve relevant context chunks from Chroma DB."""
    q_emb = embed_model.encode([query])[0].tolist()
    results = collection.query(
        query_embeddings=[q_emb],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    context_parts = []
    for d, m in zip(docs, metadatas):
        src = m.get("source", "")
        context_parts.append(f"Source: {src}\n{d}")
    return "\n\n---\n\n".join(context_parts)


# =====================
# 🧩 Add Documents
# =====================
def add_to_vectordb(text: str, source="manual"):
    """Chunk text and store in Chroma DB."""
    words = text.split()
    chunk_size, overlap = 400, 50
    chunks, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap

    embeddings = embed_texts(chunks)
    metadatas = [{"source": source, "chunk": idx} for idx in range(len(chunks))]

    collection.add(documents=chunks, metadatas=metadatas, embeddings=embeddings)
    print(f"✅ Added {len(chunks)} chunks from source: {source}")

    return len(chunks)
