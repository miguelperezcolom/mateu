---
title: "Standalone desktop app"
---

Mateu is normally deployed as a web service: a Java backend serves the API and
(optionally) the renderer, and users open it in a browser. But the exact same
application can be packaged as a **self-contained desktop tool** the user just
launches — with or without a browser.

This is how internal utilities are often shipped: no deployment, no URL to
remember, no separate install of a frontend. The user double-clicks a jar (or a
native launcher) and a normal-looking desktop app appears.

## Two ways to run it as a desktop tool

**Native desktop renderer — no browser.** Mateu ships native renderers:
[JavaFX on the desktop and Compose Multiplatform](/native/) (desktop, plus iOS
and Android). With these there is **no browser involved at all** — you ship a
genuine native desktop application, a real window like any other app. The
renderer speaks the same `/mateu/v3/sync` contract to the Mateu backend, which
you run embedded in the same process, so nothing external is required.

**Web shell — browser + local server.** Alternatively, reuse the web renderer:
run the normal Mateu web service on `localhost` and open the default browser
pointing at it; the browser is the UI shell. In *this* mode it is a *local*
server, not "no server" — everything runs on the user's machine, but the UI is a
web page served over loopback HTTP. The rest of this page covers this web-shell
setup; for the native path see [Desktop & Mobile](/native/).

## Web shell: the two ingredients

1. **Serve the renderer from the app itself.** Add a renderer dependency so the
   same service that exposes the API also serves the UI (see
   [how the renderer is served](/mateu-about/architecture/)). With
   `baseUrl=""` the frontend calls back to the very server hosting it — same
   origin, no CORS.

   ```xml
   <dependency>
     <groupId>io.mateu</groupId>
     <artifactId>vaadin-lit</artifactId>
     <version>0.0.1-MATEU</version>
   </dependency>
   ```

2. **Open the browser on startup.** Launch the default browser at the local URL
   once the server is ready.

## Opening the browser when the service starts

With Spring Boot, react to `ApplicationReadyEvent` and open the browser pointing
at the port the app is listening on:

```java
@Component
class BrowserLauncher {

  @Value("${server.port:8080}")
  int port;

  @EventListener(ApplicationReadyEvent.class)
  void openBrowser() {
    openInBrowser("http://localhost:" + port);
  }

  static void openInBrowser(String url) {
    try {
      if (Desktop.isDesktopSupported()
          && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
        Desktop.getDesktop().browse(URI.create(url));
        return;
      }
      // Fallback for headless-ish desktops (Linux without AWT desktop)
      String os = System.getProperty("os.name").toLowerCase();
      String cmd = os.contains("win") ? "rundll32 url.dll,FileProtocolHandler " + url
                 : os.contains("mac") ? "open " + url
                 : "xdg-open " + url;
      Runtime.getRuntime().exec(cmd);
    } catch (Exception e) {
      // The app still works — the user can open the URL manually.
      System.out.println("Open " + url + " in your browser.");
    }
  }
}
```

## Closing the app from a widget

Because the UI is a Mateu screen, "quit" is just an action — and this works the
same whether you run the native renderer or the web shell. Put a button (or a
[`@Fab`](/java-ui-definition/annotations/), or a toolbar action) on a screen and
shut the process down from it:

```java
@UI("")
@Title("Change Management Toolkit")
public class Home {

  // ... your screens, menus, etc.

  @Fab(icon = "vaadin:power-off", label = "Quit")
  public void quit() {
    // Give the response a moment to reach the browser, then exit.
    new Thread(() -> {
      try { Thread.sleep(300); } catch (InterruptedException ignored) {}
      System.exit(0);
    }).start();
  }
}
```

For a cleaner shutdown you can close the Spring context instead of calling
`System.exit` directly — inject `ApplicationContext` and call
`SpringApplication.exit(context, () -> 0)`.

## When this fits

This pattern shines for **internal, single-user tools** that benefit from a rich
web UI but should not require infrastructure to run — for example a utility that
generates the artifacts needed for a project's change-management process, a local
data-munging console, or a setup wizard shipped alongside a larger product.

You get the full Mateu programming model (declarative `@UI` classes, CRUDs,
wizards, validation) with the distribution profile of a desktop app: one
artifact, launched locally, closed by the user.
