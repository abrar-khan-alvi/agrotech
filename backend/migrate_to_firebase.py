import json
import os
from firebase_config import initialize_firebase, get_db_reference
from db_firebase import FirebaseDatabase

# Initialize Firebase
initialize_firebase()

DATA_FILES = {
    "fields": "data/fields.json",
    "farmers": "data/farmers.json",
    "iot_data": "data/iot_data.json",
    "advice_reports": "data/advice_reports.json",
    "consultations": "data/consultations.json",
    "experts": "data/experts.json"
}

def migrate():
    print("🚀 Starting migration to Firebase...")
    
    for collection, filename in DATA_FILES.items():
        file_path = os.path.join(os.path.dirname(__file__), filename)
        if not os.path.exists(file_path):
            print(f"⚠️  Skipping {collection}: File {filename} not found.")
            continue
            
        print(f"📦 Migrating {collection}...")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if not data:
                print(f"   Empty data in {filename}.")
                continue

            # Use our wrapper to add items
            # But the wrapper logic is a bit complex for bulk upload.
            # Let's just use raw firebase-admin reference for bulk set.
            ref = get_db_reference(collection)
            
            # Strategy: If the standard format is a list, likely integer IDs are preserved.
            # If we upload a list to Firebase, it stores as array indices 0,1,2.
            # This matches our current retrieval logic (list of objects).
            
            # HOWEVER, for better NoSQL, a dict is better.
            # But changing to dict requires changing frontend/backend parsing logic potentially if it relied on list order? 
            # Our backend routers currently return .values() or list(dict.values()) so dict storage is fine.
            # But keeping it simple: just upload the list.
            
            ref.set(data)
            print(f"✅ {collection} migrated successfully ({len(data)} items).")
            
        except Exception as e:
            print(f"❌ Failed to migrate {collection}: {e}")

    print("\n🎉 Migration completed!")

if __name__ == "__main__":
    if not os.path.exists("serviceAccountKey.json"):
        print("❌ Error: serviceAccountKey.json not found in backend/ directory.")
        print("   Please place your Firebase Admin SDK key here to run migration.")
    else:
        migrate()
