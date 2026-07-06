import os
import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        # Check if the service account key file exists
        key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "serviceAccountKey.json")
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback to default credentials or raise a warning
            print(f"Warning: Firebase service account key not found at {key_path}. "
                  "Authentication might fail in production without it.")
            try:
                firebase_admin.initialize_app()
            except ValueError:
                pass
