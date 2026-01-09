from typing import List, Dict, Any, Optional
from firebase_config import get_db_reference, initialize_firebase
import json

# Ensure Firebase is initialized when this module is imported
# This might be better placed in main.py startup event, but for simplicity here:
try:
    initialize_firebase()
except Exception as e:
    print(f"Failed to auto-init firebase in wrapper: {e}")

class FirebaseDatabase:
    """
    Adapter class to make Firebase Realtime DB look like the previous JSONDatabase.
    This minimizes changes needed in the routers.
    """
    def __init__(self, collection: str):
        self.collection = collection
        self.ref = get_db_reference(collection)

    def get_all(self) -> List[Dict[str, Any]]:
        """
        Fetches all children under the collection path.
        Returns a list of values (ignoring the keys/IDs for now, 
        or ensuring the ID is part of the value).
        """
        data = self.ref.get()
        if not data:
            return []
        
        # Realtime DB returns either a list (if integer keys) or dict (if string keys)
        if isinstance(data, list):
            return [x for x in data if x is not None]
        elif isinstance(data, dict):
            return list(data.values())
        return []

    def load(self) -> List[Dict[str, Any]]:
        """Alias for get_all to match JSONDatabase interface."""
        return self.get_all()

    def add(self, item: Dict[str, Any]):
        """
        Adds a new item.
        If the item has an 'id' or 'fieldID' or similar unique key, we could use that as the key.
        Otherwise, push() generates a unique ID.
        For compatibility with the existing list-based JSON approach where IDs are inside the object,
        we need to leverage that.
        """
        # We can use push(), but that generates a random key.
        # Ideally, we want to store it.
        # Let's try to find a natural ID if possible to use as the key, strictly for easier browsing.
        # But to match 'append' behavior, push() is safest.
        
        # However, the previous logic often calculated ID = len(list) + 1. 
        # We should stick to the item provided.
        
        # Let's use the item's ID as the key if it exists, to prevent duplicates easily.
        pk = self._find_primary_key(item)
        if pk:
            self.ref.child(str(pk)).set(item)
        else:
            self.ref.push(item)

    def save(self, data: List[Dict[str, Any]]):
        """
        Danger: This replaces the ENTIRE collection with the provided list.
        Used by the 'delete' logic in current routers (load -> filter -> save).
        """
        # Convert list to a dict structure for better Firebase storage? 
        # Or just save as list. Firebase supports lists but keys become 0, 1, 2...
        # For 'fields', preserving integer IDs 0,1,2 is okay if we are careful.
        # But generally objects are better.
        # For backward compatibility with the 'save' call which dumps a list:
        self.ref.set(data)

    def update(self, key: str, value: Any, new_data: Dict[str, Any]):
        """
        Updates an item where item[key] == value.
        Uses manual iteration for safety against type mismatches and Index structures.
        """
        data = self.ref.get()
        if not data:
            return False
            
        target_k = None
        
        # Handle both List (array) and Dict (object) structures from Firebase
        if isinstance(data, list):
            for i, item in enumerate(data):
                # Compare as strings to handle "1" vs 1 mismatch loosely
                # Ensure item is a dict before .get() to avoid 500s on corrupted data
                if isinstance(item, dict) and str(item.get(key)) == str(value): 
                     target_k = str(i)
                     break
        elif isinstance(data, dict):
            for k, item in data.items():
                if isinstance(item, dict) and str(item.get(key)) == str(value):
                    target_k = k
                    break
        
        if target_k:
            self.ref.child(target_k).set(new_data)
            return True
            
        return False
        
    def _find_primary_key(self, item: Dict[str, Any]) -> Optional[Any]:
        # Helper to guess common ID fields
        for k in ['fieldID', 'id', 'reportId', 'ioTDataID', 'consultation_id']:
            if k in item:
                return item[k]
        return None
