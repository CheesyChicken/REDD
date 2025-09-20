import chromadb
from chromadb.config import Settings as ChromaSettings
from ..settings import get_settings

_settings = get_settings()
_client = chromadb.PersistentClient(path=_settings.CHROMA_PERSIST_DIR, settings=ChromaSettings(anonymized_telemetry=False))
_collection = _client.get_or_create_collection(name="meeting_segments")


def index_segments(meeting_id: str, segments: list[dict]):
    if not segments:
        return
    ids = []
    docs = []
    metas = []
    for i, s in enumerate(segments):
        ids.append(f"{meeting_id}:{i}")
        docs.append(s["text"])
        metas.append({"meeting_id": meeting_id, "segment_id": i, "speaker": s.get("speaker"), "start": s.get("start"), "end": s.get("end")})
    _collection.add(ids=ids, documents=docs, metadatas=metas)


def search_embeddings(query: str):
    if not query:
        return []
    q = _collection.query(query_texts=[query], n_results=8)
    results = []
    for i in range(len(q.get("ids", [])[0] or [])):
        _id = q["ids"][0][i]
        doc = q["documents"][0][i]
        meta = q["metadatas"][0][i]
        dist = q.get("distances", [[None]])[0][i]
        results.append({
            "meeting_id": meta.get("meeting_id"),
            "segment_id": meta.get("segment_id"),
            "text": doc,
            "score": float(dist) if dist is not None else 0.0,
        })
    return results