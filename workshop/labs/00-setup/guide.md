# Lab 00 · Setup check (before the day, 5′)

*[Español](guide.es.md)*

Run each line; the right column is what proves it. Fix anything red **before** the session — the
room's network is not to be trusted.

## Everybody

| Check | Command | You should see |
|---|---|---|
| The repository | `git clone https://github.com/miguelperezcolom/mateu.git && cd mateu/workshop` | `README.md`, `labs/` |
| JDK 21+ | `java -version` | `21` or higher |
| Maven 3.9+ | `mvn -v` | `Apache Maven 3.9` or higher |
| Node 20+ | `node -v` | `v20` or higher |
| Docker | `docker compose -f labs/06-sign-in/keycloak/compose.yml pull` | the Keycloak image downloads |
| IDE plugin | IntelliJ: *Settings › Plugins* → **Mateu** installed · VS Code: *Extensions* → **Mateu** installed | *File › New › Project…* lists **Mateu** (IntelliJ) · *Mateu: New Project…* in the command palette (VS Code) |
| Mateu app on the phone | Open it | the **My UIs** screen |
| Mateu desktop app | Open it | the **My UIs** window |
| An MCP-capable agent | e.g. `claude --version` | a version number |
| Warm Maven | `cd labs/01-first-app/java/start && mvn -q -DskipTests package` | `BUILD SUCCESS` (also for the C#/Python tracks: lab 04 needs Maven's cache) |
| Warm the bundle plugin | `cd labs/04-ui-as-data/start && mvn -q package` | `target/mateu-bundle/index.html` exists |

## Java track

| Check | Command | You should see |
|---|---|---|
| The tests run | `cd labs/01-first-app/java/start && mvn -q test` | no failures |

## C# track

| Check | Command | You should see |
|---|---|---|
| .NET 10 SDK | `dotnet --list-sdks` | a `10.0.x` line |
| The renderers | `tools/fetch-renderers.sh` | `renderers/mateu-vaadin.jar` and `renderers/mateu-redwood.jar` |
| Warm NuGet | `cd labs/03-test-like-a-user/dotnet/solution && dotnet test Workshop.Tests` | `Passed!` |

## Python track

| Check | Command | You should see |
|---|---|---|
| Python 3.11+ | `python3 --version` | `3.11` or higher |
| The renderers | `tools/fetch-renderers.sh` | `renderers/mateu-vaadin.jar` and `renderers/mateu-redwood.jar` |
| A virtualenv + the packages | `cd labs/03-test-like-a-user/python/solution && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && pytest -q` | `passed` |

Keep that `.venv` — reuse it for every Python lab (`pip install -r requirements.txt` again in lab 06,
which adds one package).

✅ **Checkpoint**: every row green. Your track's tests pass on your machine.
