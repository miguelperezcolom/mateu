---
title: "Build a local tool with a UI"
description: "A CLI with a UI: a command starts an ordinary Mateu app on the user's machine, opens the browser on it, and a Quit button stops it. A few lines of your own code in Java, C# or Python — plus the hardening to add before you hand it to anyone."
---

Some tools are best as a command: run it, use it, close it. A **local tool** is that command with a
UI — it starts a service on the user's own machine, opens the browser on the port it listens on,
the user does the job through Mateu screens, and **Quit** in the page stops the service. Think of
a converter, a log viewer, a "what is filling my disk" explorer, an admin console for a local
database, an installer.

There is nothing special to add to Mateu for this. A local tool is **an ordinary Mateu app** plus a
few lines of your own:

1. listen on a free port,
2. open the browser there once the server is up,
3. a Quit action that answers, then stops the app.

The reference is [`demo/demo-local-tool`](https://github.com/miguelperezcolom/mateu/tree/master/demo/demo-local-tool):
"largest files under this folder" and a CSV-to-JSON converter that reads and writes local files,
in Spring Boot, with the [hardening](#recommended-hardening) below and tests for all of it.

## The recipe (Java, Spring Boot)

Start from any Mateu Spring Boot app ([Spring Boot MVC](/java-create-your-project/springboot-mvc/))
and add:

```properties
# application.properties — a free port, chosen by the OS
server.port=0
```

```java
@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    var app = new SpringApplication(Application.class);
    app.setHeadless(false); // Spring Boot runs headless by default; Desktop needs it off
    app.run(args);
  }

  // Once the server listens: print where, and open the default browser there.
  @EventListener
  void openBrowser(WebServerInitializedEvent event) throws Exception {
    var url = "http://127.0.0.1:" + event.getWebServer().getPort() + "/";
    System.out.println("Running at " + url);
    if (Desktop.isDesktopSupported()) Desktop.getDesktop().browse(URI.create(url));
  }
}
```

```java
@Component
public class Quit {
  @Autowired ConfigurableApplicationContext context;

  // Off the request thread and a moment later, so the answer reaches the browser first.
  public void soon() {
    new Thread(() -> {
      try { Thread.sleep(500); } catch (InterruptedException ignored) { }
      System.exit(SpringApplication.exit(context, () -> 0));
    }).start();
  }
}
```

```java
@UI("")
@Title("My tool")
public class Shell implements AppActionsSupplier {

  @Menu MyScreen myScreen; // what the tool does: ordinary Mateu screens

  @Autowired Quit quit;

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(new AppHeaderAction("quit", "Quit", "vaadin:power-off"));
  }

  public Message quit() {
    quit.soon();
    return new Message("The tool has stopped. You can close this tab.");
  }
}
```

That is the whole recipe (imports left out; it was run as written against Mateu 3.0-beta.68). The Quit button is an ordinary
[app header action](/ux-patterns/app-context/#header-actions): its `actionId` runs the shell's
method of that name. The demo answers with a `Dialog` instead of a toast, so the goodbye stays on
screen.

Run it with `mvn spring-boot:run`, or package it and run the jar:

```bash
mvn package
java -jar target/my-tool.jar
```

:::caution[Before you hand it to anyone]
As it stands the tool listens on every network interface, and any program — or web page — that
finds the port can drive it. For a tool that reads and writes the user's files, add the hardening
below. It is all your own code too: a property and one servlet filter.
:::

## Recommended hardening

### Listen on this machine only

```properties
server.address=127.0.0.1
```

Nothing on the network can reach the tool any more. Loopback alone is not enough, though: other
users of the same machine, other programs and **web pages open in the user's browser** can all talk
to `127.0.0.1`.

### A one-time launch token

Make a random token at startup, put it in the address you open (`/?t=<token>`) and, on the first
visit, exchange it for a cookie: `HttpOnly`, `SameSite=Strict`, path `/`. From then on, every
request — the page, its assets and Mateu's `/mateu/**` endpoints — must carry that cookie, or it
gets a 403. Only the person who ran the command sees the token (in their terminal and their
browser), and it works once, so it is useless if it ends up in a log or the browser history.

The demo's [`LaunchToken`](https://github.com/miguelperezcolom/mateu/blob/master/demo/demo-local-tool/src/main/java/io/mateu/demo/localtool/hardening/LaunchToken.java)
makes the token and the session value (32 random bytes each, compared in constant time) and
[`LocalToolGuard`](https://github.com/miguelperezcolom/mateu/blob/master/demo/demo-local-tool/src/main/java/io/mateu/demo/localtool/hardening/LocalToolGuard.java)
is the filter, ordered first:

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LocalToolGuard extends OncePerRequestFilter {
  // ...
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    if (!isLoopbackHost(request.getHeader("Host"), request.getLocalPort())) {
      refuse(response, "Unexpected Host header.");                       // see the next section
      return;
    }
    var offered = request.getParameter("t");
    if (offered != null && request.getMethod().equals("GET")) {
      if (!token.redeem(offered)) {                                      // wrong, or already used
        refuse(response, "This link was already used.");
        return;
      }
      response.addHeader("Set-Cookie", ResponseCookie.from(COOKIE, token.session())
          .httpOnly(true).sameSite("Strict").path("/").build().toString());
      response.setStatus(303);
      response.setHeader("Location", request.getRequestURI());          // drop ?t= from the bar
      return;
    }
    if (!hasSession(request)) {
      refuse(response, "Open the tool from the address the command printed.");
      return;
    }
    chain.doFilter(request, response);
  }
}
```

and the browser opens `http://127.0.0.1:<port>/?t=<token>`.

**About CSRF.** If you add Spring Security, Mateu exempts its own JSON endpoints from its CSRF
check (a cross-site JSON `POST` needs a CORS preflight, which Mateu answers only for the origins you
list — see [Security](/java-user-manual/advanced/security/)). In a local tool there is a simpler
guard on top: the session cookie is `SameSite=Strict`, so a request a foreign page makes never
carries it, and without it the filter answers 403 before Mateu sees the request.

### Check the Host header

A **DNS rebinding** attack points a name the attacker controls at `127.0.0.1`. The browser then
treats `http://attacker.example:<port>` as the attacker's own site and lets its page read the
answers — but it still sends `Host: attacker.example:<port>`. Accept only
`127.0.0.1:<port>` and `localhost:<port>` (the first lines of the filter above), and refuse
everything else, before looking at the token.

### Stop when nobody uses it

The user may close the tab without pressing Quit. The demo's
[`IdleShutdown`](https://github.com/miguelperezcolom/mateu/blob/master/demo/demo-local-tool/src/main/java/io/mateu/demo/localtool/hardening/IdleShutdown.java)
is a filter that notes the time of each request and a `@Scheduled` check (with `@EnableScheduling`)
that calls the same `Quit` when there has been none for `local-tool.idle-shutdown` (`30m` by
default, `0` = never). Pick the limit to suit the tool: a page left open and idle sends no requests,
so the tool stops under it too.

### Never fail without a display

With no display (over ssh, in CI) there is no `Desktop`, and some Linux desktops have one that
cannot browse. Print the address first, then try `Desktop` (checking
`isSupported(Desktop.Action.BROWSE)`), then the OS's own command (`open` on macOS, `xdg-open` on Linux,
`rundll32 url.dll,FileProtocolHandler` on Windows), and swallow any failure — the user can always
copy the address from the terminal. The demo's `OpenBrowser` does that, and reads
`local-tool.open-browser=false` to skip the browser altogether.

## Package it as a command

The Spring Boot jar is already the program: `java -jar local-tool.jar [arguments]`. Arguments
work like a CLI's — the demo takes the folder to inspect, defaulting to the directory it was run in
(`ApplicationArguments.getNonOptionArgs()`), and any `--name=value` overrides a property.

To make it a command, put a one-line script next to it on the `PATH`:

```sh
#!/bin/sh
exec java -jar /opt/local-tool/local-tool.jar "$@"
```

or let [JBang](https://www.jbang.dev/) install it: `jbang app install --name local-tool local-tool.jar`.
A tool that must run on machines with no Java can be bundled with its own runtime by `jpackage`.

## .NET

The same three steps on ASP.NET Core, with the same hardening as middleware. Kestrel takes port 0;
`app.Urls` holds the real address once the app has started; `IHostApplicationLifetime.StopApplication()`
stops it. Mateu creates the view, so the shell reaches the lifetime through a static field.

```csharp
using System.Diagnostics;
using System.Reflection;
using System.Security.Cryptography;
using Mateu.AspNetCore;
using Mateu.Uidl;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://127.0.0.1:0"); // loopback only, a free port
builder.Services.AddMateu(Assembly.GetExecutingAssembly());
var app = builder.Build();
Tool.Lifetime = app.Lifetime;

// --- hardening: Host check + one-time launch token
var token = RandomNumberGenerator.GetHexString(64);
var session = RandomNumberGenerator.GetHexString(64);
var used = 0;
app.Use(async (ctx, next) =>
{
    var port = ctx.Connection.LocalPort;
    var host = ctx.Request.Host.Value;
    if (host != $"127.0.0.1:{port}" && !string.Equals(host, $"localhost:{port}", StringComparison.OrdinalIgnoreCase))
    {
        ctx.Response.StatusCode = 403; await ctx.Response.WriteAsync("Unexpected Host header."); return;
    }
    var offered = ctx.Request.Query["t"].ToString();
    if (offered.Length > 0 && HttpMethods.IsGet(ctx.Request.Method))
    {
        if (!Same(offered, token) || Interlocked.Exchange(ref used, 1) == 1)
        {
            ctx.Response.StatusCode = 403; await ctx.Response.WriteAsync("This link was already used."); return;
        }
        ctx.Response.Cookies.Append("local-tool-session", session,
            new CookieOptions { HttpOnly = true, SameSite = SameSiteMode.Strict, Path = "/" });
        ctx.Response.StatusCode = 303;
        ctx.Response.Headers.Location = ctx.Request.Path.Value;
        return;
    }
    if (!Same(ctx.Request.Cookies["local-tool-session"] ?? "", session))
    {
        ctx.Response.StatusCode = 403; await ctx.Response.WriteAsync("Open the tool from the address the command printed."); return;
    }
    await next();
});

app.MapMateu(); // with MATEU_UI=<the mateu-vaadin jar> it also serves the web page

await app.StartAsync();
var url = app.Urls.First() + "/?t=" + token; // the real port, chosen by the OS
Console.WriteLine($"Local tool running at {url}");
try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
catch { Console.WriteLine("(Open the address above in your browser.)"); }
await app.WaitForShutdownAsync();

static bool Same(string a, string b) =>
    CryptographicOperations.FixedTimeEquals(System.Text.Encoding.UTF8.GetBytes(a), System.Text.Encoding.UTF8.GetBytes(b));

public static class Tool
{
    public static IHostApplicationLifetime Lifetime { get; set; } = null!;
}

[UI("/files"), ReadOnly]
public class Files
{
    public string Folder { get; set; } = Directory.GetCurrentDirectory();
    public int Count { get; set; } =
        Directory.EnumerateFiles(Directory.GetCurrentDirectory(), "*", SearchOption.AllDirectories).Count();
}

[App("Local tool")]
public class Shell : IAppActionsSupplier
{
    [MenuItem("Files")] public Files Files() => new();

    public IReadOnlyList<AppHeaderAction> AppActions() => [new("quit", "Quit", "vaadin:power-off")];

    public Message Quit()
    {
        // stop a moment later, so this answer reaches the browser first
        _ = Task.Delay(500).ContinueWith(_ => Tool.Lifetime.StopApplication());
        return new("The tool has stopped. You can close this tab.");
    }
}
```

`dotnet run` it with the project of the [.NET starter](/csharp-user-manual/) (`Mateu.AspNetCore` +
`Mateu.Uidl`), and `MATEU_UI` pointing at the `io.mateu:mateu-vaadin` jar so it serves the page.
`dotnet publish` makes the executable. Lower the log level
(`builder.Logging.SetMinimumLevel(LogLevel.Warning)`) if the console should show only your own lines.

## Python

FastAPI with uvicorn. Bind the socket yourself on `127.0.0.1` port 0 — then the port is known before
the server starts — and hand it to `Server.run(sockets=[…])`. Open the browser once
`server.started`; Quit sets `server.should_exit`.

```python
"""A local tool with a Mateu UI: python tool.py [folder]"""

import os, secrets, socket, sys, threading, time, webbrowser
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, RedirectResponse

from mateu_ui.fastapi import add_mateu
from mateu_ui.uidl import AppActionsSupplier, AppHeaderAction, Message, app, menu_item, read_only, title, ui

FOLDER = Path(sys.argv[1] if len(sys.argv) > 1 else os.getcwd()).resolve()
server: uvicorn.Server  # set in main(); Quit asks it to stop


@ui("/files")
@title("Files")
@read_only
class Files:
    folder: str = str(FOLDER)
    count: int = sum(1 for p in FOLDER.rglob("*") if p.is_file())


@app("Local tool")
class Shell(AppActionsSupplier):
    @menu_item("Files")
    def files(self) -> Files:
        return Files()

    def app_actions(self) -> list[AppHeaderAction]:
        return [AppHeaderAction("quit", "Quit", "vaadin:power-off")]

    def quit(self) -> Message:
        # stop a moment later, so this answer reaches the browser first
        threading.Timer(0.5, lambda: setattr(server, "should_exit", True)).start()
        return Message("The tool has stopped. You can close this tab.")


api = FastAPI()
add_mateu(api, sys.modules[__name__], ui=os.environ.get("MATEU_UI"))

# --- hardening: Host check + one-time launch token
TOKEN, SESSION, used = secrets.token_urlsafe(32), secrets.token_urlsafe(32), [False]


@api.middleware("http")
async def guard(request: Request, call_next):
    port = request.url.port
    if request.headers.get("host") not in (f"127.0.0.1:{port}", f"localhost:{port}"):
        return PlainTextResponse("Unexpected Host header.", status_code=403)
    offered = request.query_params.get("t")
    if offered is not None and request.method == "GET":
        if used[0] or not secrets.compare_digest(offered, TOKEN):
            return PlainTextResponse("This link was already used.", status_code=403)
        used[0] = True
        answer = RedirectResponse(request.url.path, status_code=303)
        answer.set_cookie("local-tool-session", SESSION, httponly=True, samesite="strict")
        return answer
    if not secrets.compare_digest(request.cookies.get("local-tool-session", ""), SESSION):
        return PlainTextResponse("Open the tool from the address the command printed.", status_code=403)
    return await call_next(request)


def main():
    global server
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))  # loopback only, a free port
    port = sock.getsockname()[1]
    server = uvicorn.Server(uvicorn.Config(api, log_level="warning"))
    url = f"http://127.0.0.1:{port}/?t={TOKEN}"

    def open_when_ready():
        while not server.started:
            time.sleep(0.05)
        print(f"Local tool running at {url}", flush=True)
        webbrowser.open(url)  # prints nothing and returns False when there is no browser

    threading.Thread(target=open_when_ready, daemon=True).start()
    server.run(sockets=[sock])


if __name__ == "__main__":
    main()
```

`pip install mateu-ui fastapi uvicorn` and run it with `MATEU_UI` pointing at the
`io.mateu:mateu-vaadin` jar so it serves the page (or pass `ui=` to `add_mateu`). A
`[project.scripts]` entry in your `pyproject.toml` (`local-tool = "tool:main"`) turns it into a
command with `pipx install .`.

Both programs above were run as written against Mateu 3.0-beta.68: the browser opens on the token
address, a request without the cookie or with another Host gets a 403, and Quit answers and then
stops the process. Idle shutdown is left out of them; it is a timer comparing the time of the last
request, as in the Java demo.

## See also

- [Standalone desktop app](/mateu-about/standalone-desktop/) — the same idea from the packaging
  side: a jar or a native launcher, a browser or the IntelliJ renderer as the shell.
- [Install as a desktop or phone app](/deploy/install-as-app/) — a deployed UI installed from the
  browser.
- [Production checklist](/deploy/production-checklist/) — for the opposite case: a UI served to many
  users.
