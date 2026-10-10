"""Runnable Python Mateu demo. Serves the same /mateu/v3/sync wire as the Java and C# backends.

    cd backend/python && . .venv/bin/activate
    uvicorn samples.demo.main:app --host 0.0.0.0 --port 8594
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from fastapi import FastAPI  # noqa: E402

from mateu_fastapi import add_mateu  # noqa: E402
from samples.demo import views  # noqa: E402

app = FastAPI(title="Mateu Python demo")
# The demo is driven by renderers served from OTHER origins during development (the Vite dev
# server, Expo web), so it lists them; a production app lists its own front-end origins, or none
# when the renderer is served by the same app.
add_mateu(
    app,
    views,
    cors_origins=["http://localhost:5173", "http://localhost:8081", "http://localhost:19006"],
    dev=True,
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8594)
