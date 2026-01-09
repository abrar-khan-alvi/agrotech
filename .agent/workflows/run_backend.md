---
description: How to run the backend server
---

1. Open a terminal in `backend` directory.
2. If this is the first time, run:
   ```powershell
   python -m venv venv
   .\venv\Scripts\pip install -r requirements.txt
   ```
   // turbo
3. Run the server:
   ```powershell
   .\venv\Scripts\python -m uvicorn main:app --reload
   ```
