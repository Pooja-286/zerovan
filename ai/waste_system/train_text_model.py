from pathlib import Path
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "waste_training.csv"
MODEL_PATH = ROOT / "models" / "waste_text_model.joblib"

def main():
    df = pd.read_csv(DATA_PATH).dropna(subset=["description", "category"])
    df["description"] = df["description"].astype(str).str.strip()
    df["category"] = df["category"].astype(str).str.strip()
    df = df[(df.description != "") & (df.category != "")]
    if len(df) < 10 or df.category.nunique() < 2:
        raise ValueError("Need at least 10 labelled examples and 2 categories.")
    model = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), lowercase=True, strip_accents="unicode")),
        ("classifier", LogisticRegression(max_iter=1500, class_weight="balanced")),
    ])
    model.fit(df.description, df.category)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved text model: {MODEL_PATH}")
    print(f"Training rows: {len(df)}; categories: {sorted(df.category.unique())}")
    print("Starter model only; validate on a separate real-world test set before relying on it.")

if __name__ == "__main__":
    main()
