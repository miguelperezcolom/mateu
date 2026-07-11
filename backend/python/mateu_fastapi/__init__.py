"""ASP.NET-style ``add_mateu`` — wires the ``POST /mateu/v3/sync/{route}`` endpoint onto a FastAPI app."""

from __future__ import annotations

from types import ModuleType

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from mateu_core import MateuRegistry, RunActionRq, SyncHandler


def add_mateu(
    app: FastAPI,
    *sources: ModuleType | type,
    translator=None,
    base_url: str = "",
    cors: bool = True,
) -> None:
    """Register the Mateu sync endpoint, discovering ``@app``/``@ui`` views in ``sources``."""
    registry = MateuRegistry(*sources)
    handler = SyncHandler(registry, translator)

    if cors:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )

    prefix = base_url.rstrip("/")

    async def sync(request: Request, route: str = "") -> JSONResponse:
        body = await request.body()
        rq = RunActionRq.model_validate_json(body) if body else RunActionRq()
        if not rq.route:
            rq.route = route
        request_base_url = str(request.base_url).rstrip("/") + (f"/{base_url.strip('/')}" if base_url else "")
        increment = handler.handle(rq, request_base_url)
        return JSONResponse(increment.model_dump(by_alias=True, mode="json"))

    app.add_api_route(f"{prefix}/mateu/v3/sync/{{route:path}}", sync, methods=["POST"])
    app.add_api_route(f"{prefix}/mateu/v3/sync", sync, methods=["POST"])


__all__ = ["add_mateu"]
