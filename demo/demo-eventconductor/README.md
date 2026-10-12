# demo-eventconductor — using an external Mateu UI

[EventConductor](https://github.com/miguelperezcolom/eventconductor) is a workflow engine whose
console is built with Mateu. This demo uses that console from Mateu apps, both ways (guide:
`doc/…/java-user-manual/build/using-external-mateu-uis.md`):

| Module | Port | What it shows |
|---|---|---|
| [`inprocess`](inprocess) | 8620 | **In-process.** The engine (`io.mateu.workflow:workflow-engine` 2.23.10, H2) embedded in a Mateu app; its console mounted with `mateu.ui.modules=io.mateu.workflow.infra.in.ui` and placed in the app's own menu next to the app's screens. It also serves the console at `/_workflow` (CORS open to the two shells), i.e. it is the "EventConductor service" the shells compose. |
| [`shell`](shell) | 8621 | **Federated, Java.** An `@UI` shell with the console as a `RemoteMenu` section, and as a `MicroFrontend` island in one of its own pages (`/embedded`). Console url: `-Dec.console.url=…` / `EC_CONSOLE_URL`, default `http://localhost:8620`. |
| [`shell-yaml`](shell-yaml) | 8622 | **Federated, YAML.** The same shell authored as data (`type: UI` mount + `type: AppShell` with a `RemoteMenu`), no Java UI. |

EventConductor 2.23.10 was built on Mateu 3.0-alpha.371 under the pre-rename artifact ids;
`inprocess` imports `io.mateu:mateu-bom`, which relocates them, so one Mateu ends up on the
classpath.

## Run

The demo tracks master (`mateu.version` = `0.0.1-MATEU`):

```bash
cd backend && mvn install -DskipTests
cd ../demo/demo-eventconductor && mvn package -DskipTests
java -jar inprocess/target/demo-eventconductor-inprocess-1.0-SNAPSHOT.jar     # http://localhost:8620
java -jar shell/target/demo-eventconductor-shell-1.0-SNAPSHOT.jar             # http://localhost:8621
java -jar shell-yaml/target/demo-eventconductor-shell-yaml-1.0-SNAPSHOT.jar   # http://localhost:8622
```

Then, from `e2e/` (`npm ci` once): `node external-ui-probe.mjs` checks all of it in a real browser
(menu merge, cross-origin loads with the token, deep links, the process diagram's module, the
island, the in-process screens).

To compose EventConductor's OWN console instead (its `testbench/workflow-embedded` on 2.23.10 /
alpha.371, say on :8611): run `shell` with `-Dec.console.url=http://localhost:8611 --server.port=8623`
and the probe with `SHELLS=http://localhost:8623 CONSOLE=http://localhost:8611 INPROCESS= ISLAND=`.
Everything passes except the process diagram, whose module that console does not serve with CORS
(see `ConsoleAssetsCors` in `inprocess` for the fix it needs).

`inprocess` starts `hello-world` at boot and `slow-saga` every two minutes (it rolls back on
purpose), so the lists are never empty.
