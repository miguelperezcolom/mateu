---
title: Sign-in providers
description: Declare the ways to sign in once; the web, the phone app and the desktop app offer them — a direct sign-in or a chooser — while your framework validates what arrives.
---

A Mateu UI declares **the ways its users sign in** — one identity provider, or several ("Continue
with Google", "Continue with Microsoft", "Sign in with Acme SSO"…). Every client offers them: the
web renderers (Vaadin and Redwood), the [phone app](/native/react-native/) and the
[desktop app](/native/desktop-app/). With one provider the user goes straight to it; with several
they get a sign-in chooser.

## The model: Mateu offers the sign-in, your framework validates it

Mateu ships UI only. Signing in is UI, so the clients do it; **checking who is calling is not**, so
your framework does it, as for any other client of your API:

| Provider kind | What the client does | What your framework does |
|---|---|---|
| `oidc` | runs OpenID Connect Authorization Code + PKCE against the issuer (a public client, no secret), keeps the tokens, refreshes them, and sends `Authorization: Bearer <access token>` on every Mateu request | validates the token as a **resource server** (Spring `oauth2ResourceServer`, Quarkus OIDC `service`, Micronaut JWT, MicroProfile JWT, ASP.NET `AddJwtBearer`, your FastAPI dependency) |
| `redirect` | sends the browser to the provider's `url` (adding `continue=<the current address>`) | owns the whole login — Spring `oauth2Login`, Quarkus OIDC `web-app`, ASP.NET `Challenge`, SAML, form login… — and sets a **session cookie** |

`redirect` is how providers whose login needs a **client secret** are supported: GitHub, Facebook,
X, Apple (a client-secret JWT), Google on the web. The secret stays in your server, never in a
browser or an app.

With an `oidc` provider the web client keeps the access token in a `SameSite=Strict` cookie it
writes itself (its refresh token in `sessionStorage`) — [where and why](/java-user-manual/advanced/security/#where-the-browser-keeps-the-bearer-token).
A script-written cookie cannot be HttpOnly; when no token should be readable by the page at all, use
a `redirect` provider and let your framework keep the session:
[HttpOnly cookie](#httponly-cookie-let-the-server-keep-the-session).

Mateu then reads the identity your framework established — roles, groups, scopes — for
`@EyesOnly`, `@ReadOnlyUnless`, `@DisabledUnless` and YAML `access:`
([how authorization works](/java-user-manual/advanced/security/#how-authorization-works)).
Mateu itself never decodes a token.

## Declaring the providers

In the settings — `application.properties`, a JVM `-D` property, or the environment variable of the
same name (`mateu.auth.providers.acme.client-id` → `MATEU_AUTH_PROVIDERS_ACME_CLIENT_ID`):

```properties
mateu.auth.providers=acme,github

mateu.auth.providers.acme.label=Acme SSO
mateu.auth.providers.acme.issuer=https://sso.acme.com/realms/acme
mateu.auth.providers.acme.client-id=mateu-ui

# a well-known id needs nothing else: GitHub is a redirect to /oauth2/authorization/github
```

The order of `mateu.auth.providers` is the order of the chooser.

In code (Java), a `SignInProvidersSupplier` bean — used when the settings name no provider:

```java
@Component
public class SignIn implements SignInProvidersSupplier {
  @Override
  public List<SignInProvider> signInProviders() {
    return List.of(
        SignInProvider.oidc("acme", "Acme SSO", "https://sso.acme.com/realms/acme", "mateu-ui"),
        SignInProvider.preset("github"));
  }
}
```

C# (`MateuOptions`) and Python (`add_mateu`) — the same environment variables win over them:

```csharp
builder.Services.AddMateu(o =>
{
    o.SignIn = [new SignInProvider("acme") { Label = "Acme SSO", Issuer = "https://sso.acme.com/realms/acme", ClientId = "mateu-ui" },
                new SignInProvider("github")];
}, typeof(Program).Assembly);
```

```python
add_mateu(app, views, sign_in=[
    SignInProvider("acme", label="Acme SSO", issuer="https://sso.acme.com/realms/acme", client_id="mateu-ui"),
    SignInProvider("github"),
])
```

**Where the providers come from**, the first that names any wins — they are never merged:

1. the settings (`mateu.auth.providers`);
2. the code (`SignInProvidersSupplier` beans in bean order, `MateuOptions.SignIn`, `add_mateu(sign_in=…)`);
3. the single provider of before — `@MobileApp(oidcIssuer, oidcClientId, scopes)` /
   `mateu.mobile.oidc.issuer|client-id|scopes` — offered as provider `default` on the phone and the
   desktop only (its client is the apps', which a browser cannot complete). It keeps working
   unchanged; declare `mateu.auth.providers` to offer a sign-in on the web too.

An unusable provider — an `oidc` one without issuer or client id, a `redirect` one without a usable
url, an unknown type — is **left out with a WARN** in the log when the app starts. The rest still
work.

### Settings reference

Per provider, `mateu.auth.providers.<id>.<member>`:

| Member | Values | Default |
|---|---|---|
| `type` | `oidc` \| `redirect` | the preset's; else `redirect` when a `url` is given, else `oidc` |
| `label` | the button's text | the preset's; else the id (`acme-sso` → "Acme sso") |
| `icon` | `google` `microsoft` `apple` `github` `facebook` `x` `linkedin` `gitlab` `okta` `auth0` `keycloak` `key` | the preset's; else `key` |
| `issuer` | the OpenID Connect issuer (oidc) | the preset's |
| `client-id` | the **public** client id at that issuer (oidc) | — required for oidc |
| `scopes` | comma- or space-separated (oidc) | `openid profile` |
| `audience` | the API audience to ask for (oidc; Auth0 needs it) | none |
| `tenant` | Microsoft tenant (`microsoft`, `entra`): an id, a domain, `organizations`, `consumers` | `common` for `microsoft` |
| `url` | where the browser goes (redirect): a path of this site or an `http(s)` URL | the preset's: `/oauth2/authorization/<id>` |
| `platforms` | a subset of `web`, `mobile`, `desktop` | all three for oidc; `web` for redirect |
| `continue-param` | `false` = the client adds no `continue=` to the url | `true` |

For the whole UI:

| Setting | Meaning | Default |
|---|---|---|
| `mateu.auth.login-on-start` | `true`: sign in before the first screen; `false`: only when a call answers 401 | `true` |
| `mateu.auth.logout-url` | where **Sign out** sends the browser for a framework-owned session (oidc providers end the provider's session themselves) | none |

The icon tokens are drawn as a neutral glyph or initial with the label beside it — no trademark
artwork is shipped.

### The user menu

Once someone is signed in, the app shell's header shows **who**: their picture (or their initials),
and a menu with their name, their e-mail and **Sign out**. The server names the user on the wire
(`AppDto.user`), from the identity your framework authenticated — never from anything the browser
sends:

| Shown | Read from the principal (first that has it) |
|---|---|
| name | `name`; `given_name` + `family_name`; `preferred_username`; `login` (GitHub); `nickname`; the principal's name |
| e-mail | `email` |
| picture | `picture` (OpenID Connect); `avatar_url` (GitHub) — `http(s)` only, else initials |

With Spring's `oauth2Login` these are the logged-in user's attributes (GitHub's user API, an OIDC
id token); with a resource server, the token's claims. To show something else, register a
`UserProfileSupplier` bean (Java) — it is asked first, and an empty answer falls back to the
defaults:

```java
@Component
public class Directory implements UserProfileSupplier {
  public Optional<UserProfile> profile(HttpRequest httpRequest) {
    return employees.byLogin(httpRequest.getUserPrincipal().getName())
        .map(e -> new UserProfile(e.fullName(), e.email(), e.photoUrl()));
  }
}
```

The user menu is display only: access control keeps reading the identity (roles, groups, scopes,
permissions), never the profile. An anonymous caller is named nowhere.

A session the server names nobody for still gets the plain **Sign out** button in the header. A UI
with no header to carry it — no app shell, or a `chromeless` one — gets **Sign out** in the
bottom-left corner of the page instead (web renderer).

### Presets

| Id | Kind | What it fills in |
|---|---|---|
| `google` | oidc | issuer `https://accounts.google.com`, label Google; platforms `mobile`, `desktop` (Google's web clients need a secret — see [Google](#google)) |
| `microsoft` | oidc | issuer `https://login.microsoftonline.com/<tenant>/v2.0`, tenant `common` |
| `entra` | oidc | the same issuer from `tenant` (or give `issuer`), label Microsoft Entra ID |
| `keycloak`, `okta`, `auth0`, `cognito`, `zitadel`, `authentik` | oidc | label and icon — the **issuer is yours** and required |
| `apple`, `github`, `facebook`, `x`, `linkedin`, `gitlab` | redirect | url `/oauth2/authorization/<id>` (Spring Security's convention) — override `url` on other frameworks |

Any other id is a provider of your own: give it its type and issuer or url.

### What the clients receive

The phone and desktop apps read the providers from the UI manifest
(`GET <baseUrl>/mateu/v3/manifest`, member `auth`); the web renderers from a
`<meta name="mateu-auth">` the served page carries — only the providers offered on the web, and
only when there is one. Nothing in either is secret. (For the published phone app 1.0.1, `auth`
also keeps `type`, `issuer`, `clientId` and `scopes` of the first `oidc` provider offered on mobile.)
The exact JSON for each case is pinned by `conformance/client/sign-in.json`, identical in the Java,
.NET and Python servers.

## On the identity provider

For every `oidc` provider, create a **public client** (no secret) with **Authorization Code +
PKCE (S256)**, and allow:

- **web** — the address of the UI (its mount: `https://crm.example.com/`, or
  `https://example.com/crm` for a nested mount) as a redirect URI and a post-logout redirect URI,
  and the UI's origin for CORS (the browser calls the token endpoint itself);
- **phone** — `mateu://auth` as a redirect and post-logout redirect URI
  ([details](/deploy/mobile-app-stores/#4-sign-in-register-mateuauth-with-your-identity-provider));
- **desktop** — the **device authorization grant** ([details](/native/desktop-app/#signing-in)).

Some providers want one client per kind of app (a "single-page app" and a "native app"). Declare
two providers then, one per client, and split them with `platforms`:

```properties
mateu.auth.providers=okta-web,okta-apps
mateu.auth.providers.okta-web.label=Okta
mateu.auth.providers.okta-web.icon=okta
mateu.auth.providers.okta-web.issuer=https://acme.okta.com/oauth2/default
mateu.auth.providers.okta-web.client-id=0oa-spa
mateu.auth.providers.okta-web.platforms=web
mateu.auth.providers.okta-apps.label=Okta
mateu.auth.providers.okta-apps.icon=okta
mateu.auth.providers.okta-apps.issuer=https://acme.okta.com/oauth2/default
mateu.auth.providers.okta-apps.client-id=0oa-native
mateu.auth.providers.okta-apps.platforms=mobile,desktop
```

If your page sets a Content Security Policy, add each issuer to `connect-src`: the web client
fetches the discovery document and the tokens from it.

## Recipes

### Keycloak

Clients ▸ Create client ▸ OpenID Connect: **Client authentication off**, **Standard flow on**,
**OAuth 2.0 Device Authorization Grant on** (desktop), Advanced ▸ PKCE method **S256**; valid
redirect URIs `https://crm.example.com/*` and `mateu://auth`, the same as post-logout redirect URIs,
web origins `+`.

```properties
mateu.auth.providers=keycloak
mateu.auth.providers.keycloak.label=Acme SSO
mateu.auth.providers.keycloak.issuer=https://sso.example.com/realms/acme
mateu.auth.providers.keycloak.client-id=mateu-ui
mateu.auth.providers.keycloak.scopes=openid,profile,email,offline_access
```

Social login brokered by Keycloak (its *Identity providers*: Google, GitHub, Apple, Microsoft…)
needs nothing else in Mateu: Keycloak's own login page offers them.

### Microsoft Entra ID

App registrations ▸ New registration. Under *Authentication*: platform **Single-page application**
with the UI's address (that platform is what lets a browser redeem the code without a secret),
platform **Mobile and desktop applications** with `mateu://auth`, and *Allow public client flows*
**Yes** (the desktop's device flow). Under *Expose an API*, add a scope (`api://<client-id>/access`)
and ask for it — without one the access token is for Microsoft Graph, which your API cannot
validate.

```properties
mateu.auth.providers=entra
mateu.auth.providers.entra.tenant=contoso.onmicrosoft.com
mateu.auth.providers.entra.client-id=2a4b…
mateu.auth.providers.entra.scopes=openid,profile,offline_access,api://2a4b…/access
```

`microsoft` instead of `entra` (tenant `common`) signs in work and personal Microsoft accounts;
your resource server must then accept the issuer of each tenant it lets in.

### Okta

Applications ▸ Create App Integration ▸ OIDC: a **Single-Page Application** for the web and a
**Native Application** (with *Device Authorization* for the desktop) for the apps, both with
*Authorization Code* + PKCE; sign-in redirect URIs as above. Use a custom authorization server
(`/oauth2/default`) so the access token is a JWT for your API. Declare one provider per client, as
in the Okta example above.

### Auth0

Applications ▸ Create Application: **Single Page Web Application** (web) and **Native** (phone,
desktop — enable *Device Code* under Advanced ▸ Grant Types). Under APIs, create your API and use
its identifier as the `audience`: without it Auth0 hands out an opaque token your API cannot
validate.

```properties
mateu.auth.providers=auth0
mateu.auth.providers.auth0.issuer=https://acme.eu.auth0.com/
mateu.auth.providers.auth0.client-id=Xy12…
mateu.auth.providers.auth0.audience=https://api.acme.com
```

(The trailing slash is part of Auth0's issuer.)

### AWS Cognito

A user pool with a managed login domain; an **app client without a client secret**, Authorization
code grant, scopes `openid profile`, callback and sign-out URLs as above. Cognito has no device
flow, so offer it on `web,mobile`.

```properties
mateu.auth.providers=cognito
mateu.auth.providers.cognito.issuer=https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_AbCdEf
mateu.auth.providers.cognito.client-id=3n4b…
mateu.auth.providers.cognito.platforms=web,mobile
```

### Zitadel

Project ▸ New application: **User Agent** with PKCE (web) and **Native** (apps, with *Device Code*
for the desktop); redirect URIs as above.

```properties
mateu.auth.providers=zitadel
mateu.auth.providers.zitadel.issuer=https://acme.zitadel.cloud
mateu.auth.providers.zitadel.client-id=2836…@acme
```

### Authentik

Applications ▸ Providers ▸ **OAuth2/OpenID Provider**, client type **Public**, redirect URIs as
above; the issuer is the application's (`/application/o/<slug>/`).

```properties
mateu.auth.providers=authentik
mateu.auth.providers.authentik.issuer=https://auth.example.com/application/o/crm/
mateu.auth.providers.authentik.client-id=crm-ui
```

### Google

Google's **web** OAuth clients always need a client secret, so on the web Google is a `redirect`
through your framework (Spring: `spring.security.oauth2.client.registration.google.*`, see
[Spring](#spring-boot) below):

```properties
mateu.auth.providers=google
mateu.auth.providers.google.type=redirect
# url defaults to /oauth2/authorization/google
```

For the apps, Google's native client types expect their own redirect schemes rather than
`mateu://auth`; the dependable way is to let your identity provider broker Google (Keycloak,
Entra External ID, Auth0, Okta, Cognito, Zitadel all offer "Sign in with Google") and declare that
provider instead.

### Apple

Sign in with Apple needs a client secret (a JWT signed with your key), so it is a `redirect`
through your framework — or brokered by your identity provider. With Spring, register Apple as a
client with its endpoints (`https://appleid.apple.com/auth/authorize`, `…/auth/token`, issuer
`https://appleid.apple.com`) and the generated secret; then:

```properties
mateu.auth.providers=apple
```

### GitHub

A GitHub OAuth App (Settings ▸ Developer settings ▸ OAuth Apps) with the callback your framework
uses (Spring: `https://crm.example.com/login/oauth2/code/github`). GitHub is not OpenID Connect —
it is always a `redirect`:

```properties
mateu.auth.providers=github
spring.security.oauth2.client.registration.github.client-id=Iv1.…
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_SECRET}
```

### Facebook

The same as GitHub, with a Facebook app (Facebook Login ▸ Valid OAuth redirect URIs = your
framework's callback):

```properties
mateu.auth.providers=facebook
spring.security.oauth2.client.registration.facebook.client-id=…
spring.security.oauth2.client.registration.facebook.client-secret=${FACEBOOK_SECRET}
```

### Any other OpenID Connect provider

Ping, OneLogin, IBM Verify, Dex, Gluu, your own… — anything with a discovery document at
`<issuer>/.well-known/openid-configuration` and public clients with PKCE:

```properties
mateu.auth.providers=corp
mateu.auth.providers.corp.label=Corporate account
mateu.auth.providers.corp.issuer=https://idp.corp.example
mateu.auth.providers.corp.client-id=mateu
```

### SAML, form login, anything your framework does

Point a `redirect` provider at the address where your framework starts its login:

```properties
mateu.auth.providers=corp
mateu.auth.providers.corp.label=Corporate SSO
mateu.auth.providers.corp.url=/saml2/authenticate/corp
# Spring form login: url=/login
```

Set `continue-param=false` when the login page should not receive `continue=`.

## The framework side

The pages and assets of the UI can stay public — the client needs to load them to show the chooser —
while the Mateu API (`<baseUrl>/mateu/v3/**`) requires an authenticated caller and answers **401**
(not a redirect) to one that is not: that 401 is what makes a client sign in (and, with
`login-on-start=false`, the only thing that does).

### Spring Boot

**`oidc` providers — a resource server:**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://sso.example.com/realms/acme
```

Several issuers: an `AuthenticationManagerResolver` —
`http.oauth2ResourceServer(o -> o.authenticationManagerResolver(JwtIssuerAuthenticationManagerResolver.fromTrustedIssuers(issuerA, issuerB)))`.

**`redirect` providers — `oauth2Login`:**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

```properties
spring.security.oauth2.client.registration.github.client-id=Iv1.…
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_SECRET}
```

It serves `/oauth2/authorization/<registration>` — exactly the presets' url. After the login Spring
sends the browser to the last request it REFUSED, and with Mateu that is never a page (the page is
open) but one of its calls — a sync POST, the PWA manifest: without the request cache below the user
ends up looking at `/mateu/v3/pwa/manifest.webmanifest?continue` instead of the app. With it the user
lands on the root (`defaultSuccessUrl` changes it; Spring does not read the `continue=` the client
adds).

**Both together**, the API answering 401 instead of redirecting:

```java
@Bean
SecurityFilterChain security(HttpSecurity http) throws Exception {
  RequestMatcher api = request -> request.getRequestURI().contains("/mateu/v3/");
  // after the login, back to a page — never to the Mateu call that was refused
  HttpSessionRequestCache pagesOnly = new HttpSessionRequestCache();
  pagesOnly.setRequestMatcher(request -> !api.matches(request));
  return http
      .authorizeHttpRequests(a -> a.requestMatchers(api).authenticated().anyRequest().permitAll())
      .requestCache(c -> c.requestCache(pagesOnly))
      .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))   // oidc providers
      .oauth2Login(Customizer.withDefaults())                         // redirect providers
      .exceptionHandling(e -> e.defaultAuthenticationEntryPointFor(
          new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), api))
      .logout(l -> l.logoutSuccessUrl("/"))
      .build();
}
```

With `mateu.auth.logout-url=/logout`, Sign out sends the browser to `GET /logout`; Spring's logout
answers `POST` only while CSRF protection is on — allow the GET
(`logoutRequestMatcher(PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/logout"))`)
or leave `logout-url` out. Mateu's JSON calls are already exempt from CSRF
([details](/java-user-manual/advanced/security/#wiring-each-framework)).

### Quarkus

`oidc` providers — `quarkus-oidc` as a service (bearer tokens):

```properties
quarkus.oidc.auth-server-url=https://sso.example.com/realms/acme
quarkus.oidc.application-type=service
quarkus.http.auth.permission.api.paths=/mateu/v3/*
quarkus.http.auth.permission.api.policy=authenticated
```

Several issuers: OIDC multi-tenancy (`quarkus.oidc.<tenant>.auth-server-url` + a
`TenantResolver`). `redirect` providers — a `web-app` (or `hybrid`, for both) tenant with one of
Quarkus' well-known providers (`quarkus.oidc.provider=github|google|microsoft|apple|facebook|x…`)
logs in when a protected path is visited: protect a path such as `/login` with a resource that
redirects to `/`, and point the provider's `url` at it
(`mateu.auth.providers.github.url=/login`).

### Micronaut

`oidc` providers — `micronaut-security-jwt` validating against the issuer's JWKS
([wiring](/java-user-manual/advanced/security/#wiring-each-framework)). `redirect` providers —
`micronaut-security-oauth2` with `micronaut.security.oauth2.clients.<name>.*`; its login starts at
`/oauth/login/<name>`, so set `mateu.auth.providers.<id>.url=/oauth/login/<name>`.

### Helidon MP

`oidc` providers — MicroProfile JWT (`helidon-microprofile-jwt-auth`, `mp.jwt.verify.*`).
`redirect` providers — Helidon's OIDC security provider (`security.providers.oidc` with
`redirect: true`) sends a visitor of a protected path to the identity provider and back: point the
provider's `url` at such a path.

### ASP.NET Core

```csharp
builder.Services.AddAuthentication(o =>
    {
        o.DefaultScheme = "smart";        // bearer when the request carries one, else the cookie
        o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddPolicyScheme("smart", null, o => o.ForwardDefaultSelector = ctx =>
        ctx.Request.Headers.Authorization.ToString().StartsWith("Bearer ")
            ? JwtBearerDefaults.AuthenticationScheme : CookieAuthenticationDefaults.AuthenticationScheme)
    .AddJwtBearer(o => { o.Authority = "https://sso.example.com/realms/acme"; o.Audience = "mateu-ui"; }) // oidc
    .AddCookie()
    .AddGitHub(o => { o.ClientId = "…"; o.ClientSecret = builder.Configuration["GitHub:Secret"]!; }); // redirect (AspNet.Security.OAuth.GitHub)

app.MapGet("/login/{scheme}", (string scheme) =>
    Results.Challenge(new AuthenticationProperties { RedirectUri = "/" }, [scheme]));
```

and `MATEU_AUTH_PROVIDERS_GITHUB_URL=/login/GitHub`. Mateu reads `HttpContext.User`, whichever
scheme set it.

### FastAPI

`oidc` providers — verify the bearer token in a dependency or middleware (e.g. PyJWT's
`PyJWKClient` against the issuer's `jwks_uri`) and hand Mateu the result:

```python
claims = jwt.decode(token, jwks.get_signing_key_from_jwt(token).key, algorithms=["RS256"],
                    audience="mateu-ui", issuer=ISSUER)
request.state.mateu_identity = identity_from_claims(claims)
```

`redirect` providers — an OAuth client such as Authlib's Starlette integration: a `/login/github`
route returning `authorize_redirect`, a callback that stores the user in the session
(`SessionMiddleware`), and a middleware that turns the session's user into
`request.state.mateu_identity`. Then `MATEU_AUTH_PROVIDERS_GITHUB_URL=/login/github`.

## HttpOnly cookie: let the server keep the session

With an `oidc` provider the browser holds the access token, and Mateu keeps it in a cookie the
client writes ([details](/java-user-manual/advanced/security/#where-the-browser-keeps-the-bearer-token)).
A cookie written by JavaScript can never be **HttpOnly** — only a server's `Set-Cookie` header can
set that flag — so a script injected into the page could read the token. When no token may be
readable by the page at all, move the OpenID Connect flow to the server (the "backend for
frontend" pattern):

1. The UI declares a `redirect` provider pointing at your framework's login address.
2. Your framework runs the OIDC Authorization Code flow **server-side**: it redirects to the
   identity provider, receives the callback, redeems the code with its client secret and keeps the
   tokens in its own session.
3. It answers with a session cookie `HttpOnly; Secure; SameSite=Lax`.
4. Mateu's calls are same-origin, so the browser attaches that cookie to each of them by itself.
   There is no token in JavaScript and no `Authorization` header; your framework authenticates the
   request from its session and Mateu reads the identity it established.

**Why `Lax` and not `Strict`.** The identity provider sends the browser back to your callback with a
top-level navigation that starts on another site. A `Strict` cookie is not sent on that request, so
the server cannot find the login it started (its state / PKCE record lives in the session) and
the sign-in fails or loops; the first navigation into the app from a link elsewhere would also
arrive without the session. `Lax` sends the cookie on top-level `GET` navigations and keeps it off
cross-site subrequests and `POST`s.

**CSRF** is already covered for Mateu's calls: on Spring, Mateu exempts its JSON calls from the
CSRF filter because a cross-site page cannot forge them — they must be `application/json`, which
needs a CORS preflight, and Mateu's CORS is off unless you list origins; on the other frameworks the
same JSON-only rule refuses the forms and `text/plain` bodies a cross-site page could send
([details](/java-user-manual/advanced/security/#wiring-each-framework)). Keep your framework's CSRF
protection for its own endpoints (logout included).

**The Mateu side** is the same for every framework:

```properties
mateu.auth.providers=sso
mateu.auth.providers.sso.type=redirect
mateu.auth.providers.sso.label=Sign in
# your framework's login address (Spring's here; the others below)
mateu.auth.providers.sso.url=/oauth2/authorization/sso
mateu.auth.logout-url=/logout
```

The API (`<baseUrl>/mateu/v3/**`) must still answer **401** to an anonymous caller (not a redirect
to the login page), as in [The framework side](#the-framework-side).

### Spring Boot (MVC)

`spring-boot-starter-oauth2-client`:

```properties
spring.security.oauth2.client.registration.sso.client-id=mateu-ui
spring.security.oauth2.client.registration.sso.client-secret=${SSO_SECRET}
spring.security.oauth2.client.registration.sso.scope=openid,profile
spring.security.oauth2.client.provider.sso.issuer-uri=https://sso.example.com/realms/acme

server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=lax
```

```java
@Bean
SecurityFilterChain security(HttpSecurity http) throws Exception {
  RequestMatcher api = request -> request.getRequestURI().contains("/mateu/v3/");
  // after the login, back to a page — never to the Mateu call that was refused
  HttpSessionRequestCache pagesOnly = new HttpSessionRequestCache();
  pagesOnly.setRequestMatcher(request -> !api.matches(request));
  return http
      .authorizeHttpRequests(a -> a.requestMatchers(api).authenticated().anyRequest().permitAll())
      .requestCache(c -> c.requestCache(pagesOnly))
      .oauth2Login(Customizer.withDefaults())          // serves /oauth2/authorization/sso
      .exceptionHandling(e -> e.defaultAuthenticationEntryPointFor(
          new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), api))
      .logout(l -> l.logoutSuccessUrl("/"))
      .build();
}
```

Social providers (GitHub, Google…) are more `oauth2Login` registrations
(`spring.security.oauth2.client.registration.github.*`), each with its own `redirect` provider.
**WebFlux**: the same with `server.reactive.session.cookie.http-only|secure|same-site` and
`ServerHttpSecurity.oauth2Login(...)`. About `GET /logout` and CSRF, see
[Spring Boot](#spring-boot) above.

### Quarkus

`quarkus-oidc` as a web application:

```properties
quarkus.oidc.application-type=web-app
quarkus.oidc.auth-server-url=https://sso.example.com/realms/acme
quarkus.oidc.client-id=mateu-ui
quarkus.oidc.credentials.secret=${SSO_SECRET}
quarkus.oidc.authentication.cookie-same-site=lax
```

Its session cookie is HttpOnly (and Secure over https). The login starts when a protected path is
visited: protect a path such as `/login` with a resource that redirects to `/`, and set
`mateu.auth.providers.sso.url=/login`.

### Micronaut

`micronaut-security-oauth2` with the cookie authentication mode:

```yaml
micronaut:
  security:
    authentication: cookie
    oauth2:
      clients:
        sso:
          client-id: mateu-ui
          client-secret: ${SSO_SECRET}
          openid:
            issuer: https://sso.example.com/realms/acme
    token:
      cookie:
        cookie-same-site: Lax
```

The login starts at `/oauth/login/sso` → `mateu.auth.providers.sso.url=/oauth/login/sso`.

### Helidon

Helidon security's OIDC provider with `redirect: true` sends a visitor of a protected path to the
identity provider and keeps the result in its own cookie:

```yaml
security:
  providers:
    - oidc:
        identity-uri: https://sso.example.com/realms/acme
        client-id: mateu-ui
        client-secret: ${SSO_SECRET}
        redirect: true
        cookie-same-site: LAX
```

Point `mateu.auth.providers.sso.url` at a protected path that redirects to the app.

### ASP.NET Core

```csharp
builder.Services.AddAuthentication(o =>
    {
        // the cookie answers challenges (401 below); only /login starts the OIDC flow
        o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        o.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddCookie(o =>
    {
        o.Cookie.HttpOnly = true;
        o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        o.Cookie.SameSite = SameSiteMode.Lax;
        // the API answers 401 instead of redirecting to the login
        o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
    })
    .AddOpenIdConnect(o =>
    {
        o.Authority = "https://sso.example.com/realms/acme";
        o.ClientId = "mateu-ui";
        o.ClientSecret = builder.Configuration["Sso:Secret"];
        o.ResponseType = "code";
        o.SaveTokens = true;
    });

app.MapGet("/login", () => Results.Challenge(new AuthenticationProperties { RedirectUri = "/" },
    [OpenIdConnectDefaults.AuthenticationScheme]));
app.MapGet("/logout", async (HttpContext ctx) =>
{
    await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.Redirect("/");
});
```

and `MATEU_AUTH_PROVIDERS_SSO_URL=/login`. Mateu reads `HttpContext.User`.

### FastAPI

Authlib's Starlette client and Starlette's `SessionMiddleware` (a signed, HttpOnly cookie):

```python
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware

oauth = OAuth()
oauth.register("sso", client_id="mateu-ui", client_secret=SSO_SECRET,
               server_metadata_url=ISSUER + "/.well-known/openid-configuration",
               client_kwargs={"scope": "openid profile"})

@app.get("/login")
async def login(request: Request):
    return await oauth.sso.authorize_redirect(request, str(request.url_for("auth")))

@app.get("/auth")
async def auth(request: Request):
    token = await oauth.sso.authorize_access_token(request)
    request.session["user"] = dict(token["userinfo"])
    return RedirectResponse("/")

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/")

@app.middleware("http")
async def identity(request: Request, call_next):
    user = request.session.get("user")
    if user:
        request.state.mateu_identity = identity_from_claims(user)
    return await call_next(request)

# added LAST so it runs FIRST (Starlette: the last middleware added is the outermost), and the
# identity middleware above finds the session decoded
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET, https_only=True, same_site="lax")
```

and `MATEU_AUTH_PROVIDERS_SSO_URL=/login`.

### Trade-offs

- **Native apps cannot use this session.** The phone and desktop apps do not share the browser's
  cookie jar: declare an `oidc` provider offered on `mobile` / `desktop` as well
  (`mateu.auth.providers.<id>.platforms`), and have your framework accept bearer tokens on the
  API besides its session.
- **Spring's `oauth2Login` ignores `continue=`**, so after signing in the user lands on the root
  (or your `defaultSuccessUrl`), not on the deep link they opened — provided its request cache
  remembers pages only (the `pagesOnly` cache above); left as it is, it sends the user back to a
  refused Mateu call.
- Signing out has to end the framework's session (`mateu.auth.logout-url`); ending the identity
  provider's own session is the framework's RP-initiated logout, if you configure it.

## Related

- [Security](/java-user-manual/advanced/security/) — how the identity your framework established
  drives what each user sees
- [Session expiry without losing work](/ux-patterns/session-expiry/) — what a 401 in the middle of
  an action does
- [App Store & Google Play](/deploy/mobile-app-stores/) and [the desktop app](/native/desktop-app/)
  — signing in on the native apps
