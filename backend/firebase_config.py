import firebase_admin
from firebase_admin import credentials, db
import os
import sys

# Path to the service account key
# We expect this file to be in the same directory as this script (backend/)
CRED_PATH = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    if not firebase_admin._apps:
        if not os.path.exists(CRED_PATH):
            print(f"WARNING: Firebase credentials not found at {CRED_PATH}. Firebase features will fail.")
            # We might want to raise an error here strictly, but for now lets print warning
            return

        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://shonali-desh-19ead-default-rtdb.firebaseio.com/'
        })
        print("✅ Firebase Admin SDK Initialized")
    else:
        print("ℹ️ Firebase App already initialized")

def get_db_reference(path: str):
    """Returns a reference to a specific path in the Realtime Database."""
    return db.reference(path)
