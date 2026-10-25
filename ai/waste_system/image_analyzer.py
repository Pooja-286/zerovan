from pathlib import Path
from PIL import Image, UnidentifiedImageError

MAX_IMAGES = 5
MAX_BYTES = 10 * 1024 * 1024
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
CANDIDATES = [
    "a photograph of plastic waste, such as a plastic bottle or plastic packaging",
    "a photograph of paper or cardboard waste",
    "a photograph of glass waste, such as a glass bottle or jar",
    "a photograph of metal waste, such as a metal can or scrap",
    "a photograph of textile waste, such as old clothes or fabric",
    "a photograph of footwear waste, such as old shoes",
    "a photograph of electronic waste, such as a broken phone or electronic device",
    "a photograph of organic food waste, such as vegetable peels",
    "a photograph of mixed or other household waste",
]
_PIPELINE = None

def _get_pipeline():
    global _PIPELINE
    if _PIPELINE is None:
        try:
            from transformers import pipeline
            _PIPELINE = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")
        except Exception as exc:
            raise RuntimeError("Image model failed to load. Check internet access and torch/transformers installation.") from exc
    return _PIPELINE

def _map_label(label):
    label = label.lower()
    if "plastic" in label: return "plastic"
    if "paper" in label or "cardboard" in label: return "paper_cardboard"
    if "glass" in label: return "glass"
    if "metal" in label: return "metal"
    if "textile" in label or "clothes" in label or "fabric" in label: return "textile"
    if "footwear" in label or "shoes" in label: return "footwear"
    if "electronic" in label or "phone" in label: return "e_waste"
    if "organic" in label or "food" in label: return "organic"
    return "other"

def analyze_images(image_paths):
    paths = list(image_paths or [])
    if len(paths) > MAX_IMAGES:
        raise ValueError("Please provide no more than 5 images.")
    outputs = []
    for raw in paths:
        path = Path(raw).expanduser()
        if not path.is_file(): raise FileNotFoundError(f"Image not found: {path}")
        if path.suffix.lower() not in ALLOWED_SUFFIXES: raise ValueError(f"Unsupported image type: {path.name}")
        if path.stat().st_size > MAX_BYTES: raise ValueError(f"Image exceeds 10 MB: {path.name}")
        try:
            with Image.open(path) as im:
                im = im.convert("RGB")
                im.thumbnail((1024, 1024))
                ranked = _get_pipeline()(im, candidate_labels=CANDIDATES)
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError(f"Could not read image: {path.name}") from exc
        if ranked:
            outputs.append({"file": path.name, "category": _map_label(ranked[0]["label"]), "confidence": float(ranked[0]["score"])})
    if not outputs: return {"items": [], "category": None, "confidence": 0.0}
    totals = {}
    counts = {}
    for item in outputs:
        c = item["category"]
        totals[c] = totals.get(c, 0.0) + item["confidence"]
        counts[c] = counts.get(c, 0) + 1
    category = max(totals, key=totals.get)
    return {"items": outputs, "category": category, "confidence": totals[category] / counts[category]}
