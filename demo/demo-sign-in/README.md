# demo-sign-in — signing in with GitHub

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
3. `mvn spring-boot:run` and open <http://localhost:8080>: the browser goes straight to GitHub
   (one provider), and comes back to the app signed in. **Who am I** shows the GitHub profile the
   session carries; **Sign out** in the header ends the session (`GET /logout`).

## What `SecurityConfig` does, and why

- The page is open; every Mateu call (`/mateu/**`) needs a signed-in user and answers **401**, not a
  redirect to a login page — the 401 is what makes the Mateu client sign in again.
- Spring's request cache remembers **pages only**: after the login Spring returns to the last
  request it refused, and with Mateu that would be one of its calls (the PWA manifest…).
- `GET /logout` is allowed, because Mateu's Sign out is a plain navigation.
