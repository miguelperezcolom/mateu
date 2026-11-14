"""Minimal Mateu app on FastAPI.

    pip install -r requirements.txt
    uvicorn main:app --port 8080

Serves POST /mateu/v3/sync/{route}: the same wire the Java and C# backends answer, so any Mateu
renderer renders this app. With MATEU_UI=<the io.mateu:mateu-vaadin jar, or its static/ folder> it
also serves the web page at http://localhost:8080 (add_mateu(..., ui=...) does the same).
"""

from fastapi import FastAPI

import views
from mateu_ui.fastapi import add_mateu

app = FastAPI(title="Mateu starter")
# Workshop, lab 05: the app is also an MCP server, at POST /mateu/mcp (off by default — it gives any
# caller a programmatic way to drive every screen), and an agent may send UI to an open UI
# (Connect AI in the header pairs a tab).
add_mateu(app, views, mcp=True, mcp_push=True)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
