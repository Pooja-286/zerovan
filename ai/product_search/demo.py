from .search import search_products

def main():
    query = input("Search for a sustainable product or company: ").strip()
    try:
        results = search_products(query, limit=10)
        if not results:
            print("No matches found. Try 'detergent', 'refill', 'natural', or a company name.")
            return
        print(f"\nFound {len(results)} matching product(s):")
        for i, p in enumerate(results, 1):
            print(f"\n{i}. {p['product_name']} — {p['company']}")
            print(f"   Category: {p['category']}")
            print(f"   Sustainability features: {p['sustainability_features']}")
            print(f"   Description: {p['description']}")
            print(f"   Price (INR): {p['price_inr'] if p['price_inr'] is not None else 'Not listed'}")
            print(f"   Website: {p['website'] or 'Not provided'}")
    except Exception as exc:
        print(f"Search failed: {exc}")

if __name__ == "__main__":
    main()
