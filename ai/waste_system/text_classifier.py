from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "models" / "waste_text_model.joblib"

def classify_text(description: str):
    """Return a predicted material category, or None when no model is trained."""
    if not description or not description.strip() or not MODEL_PATH.exists():
        return None
    model = joblib.load(MODEL_PATH)
    probs = model.predict_proba([description])[0]
    index = int(probs.argmax())
    return {"category": str(model.classes_[index]), "confidence": float(probs[index]), "source": "text"}
