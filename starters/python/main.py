"""Minimal Mateu app on FastAPI.

    pip install -r requirements.txt
    uvicorn main:app --port 8080

Serves POST /mateu/v3/sync/{route}: the same wire the Java and C# backends answer, so any Mateu
renderer renders this app.
"""

from fastapi import FastAPI

import views
from mateu_fastapi import add_mateu

app = FastAPI(title="Mateu starter")
add_mateu(app, views)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
