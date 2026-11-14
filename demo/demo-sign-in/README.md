# demo-sign-in — signing in with GitHub or Keycloak

A Mateu UI whose users sign in with GitHub. Mateu only **offers** the sign-in
(`mateu.auth.providers=github`, a `redirect` provider); Spring Security's `oauth2Login` owns the
login, holds GitHub's client secret and keeps the session. Guide: `deploy/sign-in.md`.

## Run it

1. Create a GitHub OAuth app at <https://github.com/settings/developers> → **OAuth Apps** → **New
   OAuth App**:
   - Homepage URL: `http://localhost:8080`
   - Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
2. Generate a client secret and write both values to `secrets.properties` next to this README
   (git-ignored — never commit it):
   ```properties
   GITHUB_CLIENT_ID=…
   GITHUB_CLIENT_SECRET=…
   ```
   (or export `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`).
3. `mvn spring-boot:run` (profile `github`, the default) and open <http://localhost:8080>: the browser goes straight to GitHub
   (one provider), and comes back to the app signed in. **Who am I** shows the GitHub profile the
   session carries; **Sign out** in the header ends the session (`GET /logout`).

## What `SecurityConfig` does, and why

- The page is open; every Mateu call (`/mateu/**`) needs a signed-in user and answers **401**, not a
  redirect to a login page — the 401 is what makes the Mateu client sign in again.
- Spring's request cache remembers **pages only**: after the login Spring returns to the last
  request it refused, and with Mateu that would be one of its calls (the PWA manifest…).
- `GET /logout` is allowed, because Mateu's Sign out is a plain navigation.

## The other kind: an `oidc` provider (Keycloak, profile `keycloak`)

Here the **Mateu client** signs in itself — Authorization Code + PKCE against a public client, no
secret anywhere — keeps and refreshes the tokens and sends the access token on every call; Spring
only validates it (a resource server, no session).

1. `docker compose -f keycloak/compose.yaml up -d` — Keycloak on :8180 with realm `mateu` imported
   from `keycloak/realm-mateu.json`: public client `mateu-ui` (PKCE S256, redirect
   `http://localhost:8081/*`) and a test user `ana` / `ana` (Ana López, ana@example.com). Local
   development only.
2. `mvn spring-boot:run -Dspring-boot.run.profiles=keycloak` and open <http://localhost:8081>.

Tried end to end (2026-11-14): sign-in through Keycloak, the user menu (initials, name, e-mail from
the token), the access token (5 minutes) refreshed with no new sign-in, and Sign out ending
Keycloak's session too (the next visit asks for the password again).
