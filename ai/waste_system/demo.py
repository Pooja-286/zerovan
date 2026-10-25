from .engine import analyze_waste

def main():
    print("ZERO VAN — Waste Recovery Recommendations")
    description = input("Describe the item and its condition (optional if images are provided): ").strip()
    raw = input("Enter up to 5 image paths separated by | (or Enter to skip): ").strip()
    images = [p.strip().strip('"') for p in raw.split("|") if p.strip()] if raw else []
    if len(images) > 5:
        print("Please enter no more than 5 images.")
        return
    lat_s = input("Your latitude (optional; Enter to skip distance sorting): ").strip()
    lon_s = input("Your longitude (optional; Enter to skip distance sorting): ").strip()
    try:
        lat = float(lat_s) if lat_s else None
        lon = float(lon_s) if lon_s else None
        if (lat is None) != (lon is None):
            raise ValueError("Enter both latitude and longitude, or leave both blank.")
        result = analyze_waste(description, images, lat, lon, 10)
        print("\nRecommended next step:")
        print(result["recommendation"])
        if not result["partners"]:
            print("\nNo matching partner found in the local CSV. Add verified local partners to data/partners.csv.")
        else:
            print(f"\nSuitable options (up to {len(result['partners'])}):")
            for i, p in enumerate(result["partners"], 1):
                print(f"\n{i}. {p['name']} — {p['partner_type']}")
                print(f"   Location: {p['address']}, {p['city']}, {p['state']}")
                if p["distance_km"] is not None: print(f"   Distance: {p['distance_km']} km (straight-line estimate)")
                print(f"   Contact: {p['phone'] or 'Not provided'}")
                print(f"   Website: {p['website'] or 'Not provided'}")
                if p["is_demo_record"]: print("   DATA STATUS: DEMO / UNVERIFIED — not a real contact.")
    except Exception as exc:
        print(f"\nCould not complete analysis: {exc}")

if __name__ == "__main__":
    main()
