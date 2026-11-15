# demo-local-tool — a CLI with a UI

A **local tool**: a command starts a service on your machine, opens the browser on the port it
listens on, you use it through Mateu screens, and **Quit** in the header stops it. Two small
utilities that genuinely need the local disk:

- **Largest files** — "du with a UI": the biggest files under a folder, searchable, sortable.
- **CSV to JSON** — paste CSV, or name a CSV file on this machine; *Save next to the file* writes
  the `.json` beside it. Nothing is uploaded anywhere.

It is an ordinary Mateu app (Spring Boot MVC + `mateu-mvc` + `mateu-vaadin`) plus a few lines of
its own code — nothing was added to Mateu for it. The guide is
[Build a local tool with a UI](https://mateu.io/deploy/local-tool/).

## Run it

```bash
mvn package                       # → target/local-tool.jar (runs the tests too)
java -jar target/local-tool.jar   # inspects the current directory
java -jar target/local-tool.jar ~/Downloads
bin/local-tool ~/Downloads        # the same, as a command you can put on your PATH
```

It prints its address and opens your default browser there; on a machine with no display it only
prints the address. There is no fixed port: it asks the OS for a free one (`server.port=0`).

| Setting | Default | |
|---|---|---|
| `--local-tool.open-browser` | `true` | `false` = only print the address |
| `--local-tool.idle-shutdown` | `30m` | stop after this long without a request; `0` = never |

## What is in it

The recipe (`io.mateu.demo.localtool`):

| File | What it does |
|---|---|
| `application.properties` | `server.port=0` (a free port) and `server.address=127.0.0.1` (this machine only) |
| `Application` | `main`, with `setHeadless(false)` so `java.awt.Desktop` can open the browser |
| `OpenBrowser` | on `WebServerInitializedEvent`: read the real port, print the address, open the browser |
| `Shell` | the `@UI("")` app shell: the menu and a **Quit** header action (`AppActionsSupplier`) |
| `Quit` | answers first, then `SpringApplication.exit` + `System.exit` off the request thread |
| `LargestFiles`, `CsvToJson`, `Csv`, `ToolFolder` | the tool itself |

The hardening (`io.mateu.demo.localtool.hardening`), recommended for anything you hand to others:

| File | What it does |
|---|---|
| `LaunchToken` | a one-time token, made at startup and put in the opened address (`/?t=…`) |
| `LocalToolGuard` | a servlet filter in front of everything: Host must be `127.0.0.1:<port>`/`localhost:<port>` (DNS rebinding); the token is exchanged once for an HttpOnly, SameSite=Strict cookie; no cookie → 403 |
| `IdleShutdown` | stops the tool after `local-tool.idle-shutdown` without requests |

Tests (`mvn test`): `LocalToolGuardTest` (loopback-only bind, no cookie → 403, foreign Host → 403,
the token works once and opens the app and its `/mateu/**` endpoints), `QuitTest` (the goodbye is
answered, then the context closes and the process exits — `System.exit` replaced by a recorder),
`IdleShutdownTest`, `CsvTest`.
