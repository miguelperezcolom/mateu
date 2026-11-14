"""Minimal Mateu app on FastAPI — workshop, lab 06: signed in with Keycloak.

    pip install -r requirements.txt
    uvicorn main:app --port 8080

Mateu OFFERS the sign-in to every client (web, phone, desktop): the browser runs OpenID Connect
against the Keycloak of labs/06-sign-in/keycloak and sends ``Authorization: Bearer <token>`` on every
Mateu call. Checking that token is the app's job, as for any other client of your API: the middleware
below verifies it against Keycloak's keys and hands Mateu the identity (``request.state.mateu_identity``).
"""

import os

import jwt
from fastapi import FastAPI, Request
from fastapi.responses import Response

import views
from mateu_ui.core.identity import identity_from_claims
from mateu_ui.fastapi import add_mateu
from mateu_ui.uidl import SignInProvider

ISSUER = os.environ.get("WORKSHOP_ISSUER", "http://localhost:8180/realms/workshop")
_jwks = jwt.PyJWKClient(f"{ISSUER}/protocol/openid-connect/certs")


def verify_token(token: str) -> dict:
    """The claims of a valid access token for the mateu-ui client, else an exception."""
    key = _jwks.get_signing_key_from_jwt(token).key
    return jwt.decode(token, key, algorithms=["RS256"], audience="mateu-ui", issuer=ISSUER)


app = FastAPI(title="Mateu starter")


@app.middleware("http")
async def mateu_calls_need_a_valid_token(request: Request, call_next):
    # The page and its assets stay open (the client has to load to sign in); every Mateu call needs
    # a valid token and answers 401 without one — which is what makes the client sign in.
    if "/mateu/v3/" in request.url.path:
        auth = request.headers.get("authorization", "")
        try:
            claims = verify_token(auth.removeprefix("Bearer ").strip()) if auth.startswith("Bearer ") else None
        except Exception:
            claims = None
        if claims is None:
            return Response(status_code=401)
        request.state.mateu_identity = identity_from_claims(claims)
    return await call_next(request)


add_mateu(
    app,
    views,
    sign_in=[SignInProvider("keycloak", label="Workshop SSO", issuer=ISSUER, client_id="mateu-ui")],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
