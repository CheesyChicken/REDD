import httpx
from ..settings import get_settings

settings = get_settings()

PROMPT = """
You are an assistant that summarizes meeting transcripts.
Return a strict JSON object with keys: title, language, summary, sentiment, topics, actions.
- title: short meeting title
- language: ISO code if you can infer (like "en")
- summary: multi-paragraph executive summary
- sentiment: one of [very_positive, positive, neutral, negative, very_negative]
- topics: array of short topic labels (3-8)
- actions: array of objects { title, owner, due_date (optional), status }

Transcript:\n{{transcript}}
Respond ONLY with JSON.
"""


def generate_insights(transcript: str) -> dict:
    payload = {
        "model": settings.MODEL_NAME,
        "prompt": PROMPT.replace("{{transcript}}", transcript) ,
        "stream": False,
        "options": {"temperature": 0.2}
    }
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    with httpx.Client(timeout=120) as client:
        r = client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
        # Ollama returns {response: "..."}
        try:
            import json as _json
            return _json.loads(data.get("response", "{}"))
        except Exception:
            return {"title": "Meeting", "language": "en", "summary": "", "sentiment": "neutral", "topics": [], "actions": []}