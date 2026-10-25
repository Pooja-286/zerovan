from pathlib import Path
import re
import pandas as pd

DATA_PATH = Path(__file__).resolve().parent / "data" / "products.csv"
SYNONYMS = {
    "eco": ["eco-friendly", "sustainable", "green"],
    "friendly": ["sustainable", "environmentally friendly", "green"],
    "detergent": ["laundry", "washing", "cleaner"],
    "refill": ["refillable", "refill packs", "low waste"],
    "reusable": ["washable", "reusable"],
    "natural": ["plant-based", "plant based", "non-toxic"],
    "compostable": ["biodegradable", "low waste"],
}

def search_products(query, category=None, max_price=None, limit=10):
    if not query or not query.strip():
        raise ValueError("Enter a product type, sustainability feature, or company name.")
    if limit < 0: raise ValueError("Limit cannot be negative.")
    if not DATA_PATH.exists(): raise FileNotFoundError(f"Product dataset not found: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH).fillna("")
    required = {"product_id","company","product_name","category","description","sustainability_features","price_inr","website"}
    missing = required - set(df.columns)
    if missing: raise ValueError(f"CSV is missing columns: {sorted(missing)}")
    query = query.strip().lower().replace("frendly", "friendly").replace("eco friendly", "eco-friendly")
    words = re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)*", query)
    terms = set(words)
    for word in words: terms.update(SYNONYMS.get(word, []))
    if "eco-friendly" in query or "friendly" in query or "sustainable" in query:
        terms.update(["sustainable","eco-friendly","environmentally friendly","plant-based","low waste"])
    results = []
    for item in df.to_dict(orient="records"):
        company, name, cat = str(item["company"]).lower(), str(item["product_name"]).lower(), str(item["category"]).lower()
        full = f"{company} {name} {cat} {item['description']} {item['sustainability_features']}".lower()
        if category and cat != category.strip().lower(): continue
        try: price = float(item["price_inr"]) if str(item["price_inr"]).strip() else None
        except (ValueError, TypeError): price = None
        if max_price is not None and (price is None or price > float(max_price)): continue
        score = (10 if query in name else 0) + (8 if query in company else 0) + (5 if query in full else 0)
        for term in terms:
            if term in name: score += 3
            elif term in full: score += 1
        if score:
            item["price_inr"], item["match_score"] = price, score
            results.append(item)
    results.sort(key=lambda x: (-x["match_score"], x["price_inr"] if x["price_inr"] is not None else float("inf")))
    return results[:int(limit)]

def recommend_products(query, limit=5):
    return search_products(query=query, limit=limit)
