---
title: "Shell and remote menus"
---

Mateu allows you to build a shell application that composes UI modules from multiple services.

## The shell

The shell defines:

- authentication
- branding
- navigation
- shared UI elements

```java
@UI("")
@Title("Console")
@KeycloakSecured(...)
public class ShellHome {
}
```

## Remote menus

Remote menus allow the shell to include UI modules from other services.

```java
@Menu
RemoteMenu users = new RemoteMenu("/_users")
    .withAppServerSideType("...");
```

Each remote menu points to a UI exposed by another service.

### Descriptor caching

To build the navigation, the shell asks each remote for its descriptor (title, menu, home wiring). That is an HTTP round trip landing on the remote's home route, and it happens every time the shell resolves a route — the first of the two requests a user sees on every page change.

The descriptor is app-shaped, not request-shaped: it only changes when the remote is redeployed. The shell therefore caches it briefly, keyed by the remote's base URL, route **and** the caller's authorization token (a remote is free to build a menu per user, so the token is part of the key, stored as a SHA-256 digest).

| Property | Env var | Default |
| --- | --- | --- |
| `mateu.remote-menu.descriptor-ttl-ms` | `MATEU_REMOTE_MENU_DESCRIPTOR_TTL_MS` | `30000` |

The TTL bounds how long a redeployed remote's new menu takes to appear in the shell, which is why the default is 30 s and not longer. Set it to `0` to disable the cache and ask on every navigation. The system property wins over the environment variable.

### How the menus are merged

The browser asks every remote for its menu and puts each answer where its section is. A few rules
keep the shell steady while that happens:

- **One remote down is one section down.** The remotes are asked together and each answer is
  merged as it arrives. A remote that does not answer (within 20 s) leaves its section in the menu,
  dimmed, with a tooltip saying it is not available; it is asked again in the background (after
  10 s, 30 s and 60 s) and whenever the user clicks the section. The rest of the menu, the page on
  screen and the app-wide connection banner are not affected.
- **The shell's label wins.** When the shell declares a section's label — `@Label` on the field or
  `withLabel(...)` — that label stays, even after the remote answers with its own (when the remote
  answers with a single top-level entry, the usual "a group named after the service"). Without a
  declared label, the field name is shown until the remote answers, and then the remote's label
  replaces it, so a remote can still translate its own name. A remote that answers with several
  top-level entries has them pasted in place, as before: there is no single entry to name.
- **The section is known before the remote answers.** Each remote section travels with the route
  prefix its screens live under: the remote's own path — its field name, `/forms` for
  `RemoteMenu forms`, wherever the shell groups it. So on a cold load the active section and the
  first breadcrumb ("Admin › Forms") are there on the first paint, and the rest of the trail
  follows when the remote answers. A deep link also says which remote it was mounted from, so a
  section whose field is named after something else (`workflowAdmin` serving `/workflow/...`)
  is found too.
- **Hidden sections still place a page.** A `@Hidden` remote section is not drawn, but it stays in
  the navigation tree: a page under it gets its breadcrumbs. Its menu is fetched only while the user
  is in it.
- **The variant is the app's.** A shell with remote sections used to be forced to `MENU_ON_TOP` in
  the browser. Now the declared variant is respected; `AUTO` (and a fluent `AppShell` with no
  variant) picks `MENU_ON_TOP` for such a shell, so an app that declares nothing looks the same.

Both renderers apply the same rules: the web renderers through `navTree.ts` in `libs/mateu`, and
Redwood through a port of it (`apps/redwood/poc/navTree.mjs`, its bridge cannot import TypeScript).

### Deep links

A deep link that no local entry claims is resolved on the server. The shell picks the remote by
**longest prefix** from what it already knows — the cached menus of its remotes (see below) and
each remote's mount path — and asks only that one. Only when that tells nothing, or the chosen
remote turns the route down, are the rest asked, all at once, and the longest claim wins. A remote
that is down claims nothing; it no longer fails the shell's request.

## Ownership model

- shell → composition
- service → UI + logic

## Benefits

- no frontend integration layer
- independent deployment
- clear boundaries
- simpler architecture

## Mental model

The shell is a container.

Each service plugs its UI into it.
