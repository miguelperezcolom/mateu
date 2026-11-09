"""The Explorer's Python remote: a Reports domain on FastAPI (the `mateu-ui` package from PyPI),
speaking the same /mateu/v3/sync wire as the Java remotes — so the Explorer's federated console
merges its menu with a RemoteMenu exactly like the Java and YAML ones.

    python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
    PYTHON_REMOTE_PORT=8644 EXPLORER_ORIGIN=http://localhost:8640 .venv/bin/python main.py
"""

from __future__ import annotations

import os
import sys
from typing import Annotated

from fastapi import FastAPI

from mateu_ui.fastapi import add_mateu
from mateu_ui.uidl import Message, ReadOnly, app, button, menu_item, title, ui


@ui("reports/sales")
@title("Sales report")
class SalesReport:
    served_by: Annotated[str, ReadOnly()] = "the Python remote (FastAPI + mateu-ui)"
    total: Annotated[int, ReadOnly()] = 1280

    @button()
    def recompute(self) -> Message:
        return Message("Recomputed by Python")


@ui("reports/about")
@title("About reports")
class AboutReports:
    text: Annotated[str, ReadOnly()] = "Reports is a Python service; its screens render with the same renderer."


@ui("")
@app("Reports")
class ReportsApp:
    @menu_item("Sales report")
    def sales(self) -> SalesReport:
        return SalesReport()

    @menu_item("About reports")
    def about(self) -> AboutReports:
        return AboutReports()


api = FastAPI(title="Explorer Python remote")
# The Explorer (another origin) calls this app from the browser: CORS lists its origin.
add_mateu(api, sys.modules[__name__], cors_origins=[os.environ.get("EXPLORER_ORIGIN", "http://localhost:8640")])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(api, host=os.environ.get("PYTHON_REMOTE_HOST", "127.0.0.1"), port=int(os.environ.get("PYTHON_REMOTE_PORT", "8644")))
