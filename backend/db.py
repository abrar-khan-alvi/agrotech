import json
import os
from typing import List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

class JSONDatabase:
    def __init__(self, collection: str):
        self.file_path = os.path.join(DATA_DIR, f"{collection}.json")
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w") as f:
                json.dump([], f)

    def load(self) -> List[Dict[str, Any]]:
        try:
            with open(self.file_path, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
             return []

    def save(self, data: List[Dict[str, Any]]):
        with open(self.file_path, "w") as f:
            json.dump(data, f, indent=4) # Indent for readability

    def get_all(self) -> List[Dict[str, Any]]:
        return self.load()

    def add(self, item: Dict[str, Any]):
        data = self.load()
        data.append(item)
        self.save(data)

    def update(self, key: str, value: Any, new_data: Dict[str, Any]):
        data = self.load()
        for i, item in enumerate(data):
            if item.get(key) == value:
                data[i] = new_data
                self.save(data)
                return True
        return False
