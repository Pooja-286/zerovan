from pathlib import Path
import math
import pandas as pd
from .text_classifier import classify_text
from .image_analyzer import analyze_images

ROOT = Path(__file__).resolve().parent
DEMO_PARTNERS = ROOT / "data" / "partners_demo.csv"
REAL_PARTNERS = ROOT / "data" / "partners.csv"

ACTIONS = {
    "textile": {
        "reuse": "If clean and wearable, donate it to a clothing reuse or donation service.",
        "upcycle": "For torn or damaged fabric, try textile upcycling groups, craft workers, tailors or doormat makers.",
        "recycle": "For severely damaged or contaminated textiles, contact a textile recycler or local waste authority.",
        "assess": "Have a reuse or textile service assess the item before discarding it.",
    },
    "footwear": {
        "reuse": "If wearable, donate it or pass it to a footwear reuse service.",
        "upcycle": "If repairable, try a cobbler or shoe repair shop.",
        "recycle": "If beyond repair, contact a footwear/material recovery service.",
        "assess": "Ask a shoe repair or reuse service to assess it.",
    },
    "e_waste": {
        "reuse": "If working, consider repair, resale or donation through a reputable electronics reuse service.",
        "recycle": "If broken, use an authorized e-waste collection or recycling service. Keep batteries separate.",
        "dispose": "Contact an authorized e-waste treatment service; do not put it in household waste.",
    },
    "organic": {"reuse": "Separate suitable scraps for composting.", "recycle": "Use a composting or organic-waste collection service."},
    "paper_cardboard": {"reuse": "Reuse clean, dry paper or cardboard where practical.", "recycle": "Send clean, dry paper/cardboard to a paper recycler or collection centre."},
    "plastic": {"reuse": "Reuse it if clean, safe and functional.", "recycle": "Sort by material and check acceptance with a local plastic recycler."},
    "glass": {"reuse": "Reuse intact, clean jars or bottles if safe.", "recycle": "Keep glass separate and contact a glass collection or recycling service."},
    "metal": {"reuse": "Reuse it if safe and functional.", "recycle": "Contact a metal scrap dealer or material recovery service."},
    "mixed_hazardous": {"dispose": "Do not handle or mix unknown hazardous waste. Contact an appropriate authorized treatment service."},
    "other": {"assess": "Ask a local reuse, repair or waste-assessment service to identify the material and condition."},
}

def _condition(description):
    t = (description or "").lower()
    if any(x in t for x in ["chemical", "pesticide", "oil spill", "medical waste", "infected", "toxic", "battery leaking", "asbestos"]): return "hazardous"
    if any(x in t for x in ["moldy", "mouldy", "rotten", "contaminated", "soaked in oil", "severely damaged", "completely broken", "unusable", "burnt"]): return "bad"
    if any(x in t for x in ["torn", "ripped", "damaged", "broken", "hole", "worn out", "not working", "cracked"]): return "damaged"
    if any(x in t for x in ["good condition", "wearable", "working", "usable", "intact", "clean and usable"]): return "good"
    return "unknown"

def _route(category, condition):
    if condition == "hazardous" or category == "mixed_hazardous": return "dispose"
    if category == "textile":
        if condition == "good": return "reuse"
        if condition == "damaged": return "upcycle"
        if condition == "bad": return "recycle"
        return "assess"
    if category == "footwear":
        if condition == "good": return "reuse"
        if condition == "damaged": return "upcycle"
        return "recycle" if condition == "bad" else "assess"
    if category == "e_waste": return "reuse" if condition == "good" else "recycle"
    if condition == "good": return "reuse"
    return "recycle" if category in {"plastic", "glass", "metal", "paper_cardboard", "organic"} else "assess"

def _distance(a, b, c, d):
    r = 6371.0
    p1, p2 = math.radians(a), math.radians(c)
    dp, dl = math.radians(c-a), math.radians(d-b)
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*r*math.asin(min(1.0, math.sqrt(h)))

def find_partners(category, action, user_lat=None, user_lon=None, limit=10):
    path = REAL_PARTNERS if REAL_PARTNERS.exists() else DEMO_PARTNERS
    df = pd.read_csv(path).fillna("")
    needed = {"name","partner_type","accepted_materials","actions","address","city","state","latitude","longitude","phone","website","verified"}
    missing = needed - set(df.columns)
    if missing: raise ValueError(f"Partner CSV is missing columns: {sorted(missing)}")
    results = []
    for row in df.to_dict(orient="records"):
        materials = [v.strip().lower() for v in str(row["accepted_materials"]).split(";") if v.strip()]
        routes = [v.strip().lower() for v in str(row["actions"]).split(";") if v.strip()]
        if category.lower() not in materials and "all" not in materials: continue
        if action.lower() not in routes and "all" not in routes: continue
        row["is_demo_record"] = str(row.get("verified","")).strip().lower() not in {"true","1","yes"}
        row["distance_km"] = None
        try:
            if user_lat is not None and user_lon is not None:
                row["distance_km"] = round(_distance(float(user_lat), float(user_lon), float(row["latitude"]), float(row["longitude"])), 2)
        except (ValueError, TypeError): pass
        results.append(row)
    if user_lat is not None and user_lon is not None:
        results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else float("inf"))
    else:
        results.sort(key=lambda x: (x["is_demo_record"], str(x["name"]).lower()))
    return results[:max(0, min(int(limit), 10))]

def analyze_waste(description="", image_paths=None, user_lat=None, user_lon=None, limit=10):
    images = list(image_paths or [])
    if len(images) > 5: raise ValueError("Maximum 5 images are allowed per analysis.")
    if not (description and description.strip()) and not images:
        raise ValueError("Enter a description, upload at least one image, or provide both.")
    text_result = classify_text(description) if description and description.strip() else None
    image_result = analyze_images(images) if images else {"items": [], "category": None, "confidence": 0.0}
    tc = text_result["category"] if text_result else None
    ic = image_result["category"]
    if tc and ic:
        if tc == ic: category = tc
        else: category = tc if text_result["confidence"] >= image_result["confidence"] else ic
    else:
        category = tc or ic or "other"
    condition = _condition(description)
    action = _route(category, condition)
    guidance = ACTIONS.get(category, ACTIONS["other"]).get(action, ACTIONS["other"]["assess"])
    partners = find_partners(category, action, user_lat, user_lon, limit)
    return {"recommendation": guidance, "partners": partners,
            "internal": {"category": category, "condition": condition, "action": action,
                         "text_prediction": text_result, "image_predictions": image_result["items"],
                         "note": "Prototype predictions can be wrong; verify material and condition when uncertain."}}
