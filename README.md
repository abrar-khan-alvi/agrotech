# Agrotech Project

This repository contains the source code for the Agrotech platform, featuring a FastAPI backend and multiple React/Vite frontends (Farmer, Expert, Admin).

## Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/abrar-khan-alvi/agrotech.git
cd agrotech
```

### 2. Backend Setup (`agrotech_fastapi`)

The backend is built with FastAPI and uses Firebase Admin SDK.

1.  Navigate to the backend directory:
    ```bash
    cd agrotech_fastapi
    ```

2.  (Optional but recommended) Create and activate a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Important:** Configure Firebase Credentials.
    - You must obtain the `serviceAccountKey.json` file for your Firebase project.
    - Place the `serviceAccountKey.json` file directly inside the `agrotech_fastapi` folder.
    - *Note: This file is ignored by git for security.*

5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

There are three separate frontend applications: `farmer`, `expert`, and `admin`. Follow these steps for any of them.

#### Farmer App
1.  Navigate to the directory:
    ```bash
    cd farmer
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

#### Expert App
1.  Navigate to the directory:
    ```bash
    cd expert
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

#### Admin App
1.  Navigate to the directory:
    ```bash
    cd admin
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure

- `agrotech_fastapi/`: Main Backend API (FastAPI)
- `farmer/`: Farmer mobile/web app (React + Vite)
- `expert/`: Expert interface (React + Vite)
- `admin/`: Admin dashboard (React + Vite)
- `agrotech_api/`: (Legacy/Alternative) Backend folder
