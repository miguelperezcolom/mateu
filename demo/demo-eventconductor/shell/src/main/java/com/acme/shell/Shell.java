package com.acme.shell;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;

/**
 * A shell that owns no workflow screen: EventConductor's console runs as its own service and is
 * composed here over HTTP. The shell asks {@code <console>/_workflow} for its menu (server to
 * server) and the browser then loads each of its screens from the console directly (cross-origin:
 * the console allows this shell's origin with {@code mateu.cors.allowed-origins}).
 *
 * <p>The console's url is configuration: {@code -Dec.console.url=…} or {@code EC_CONSOLE_URL},
 * defaulting to the in-process demo next door, which serves the same console at {@code /_workflow}.
 */
@UI("")
@Title("Acme operations")
public class Shell {

  @Menu Overview overview;

  /** The console's process list as an island inside one of the shell's own pages. */
  @Menu EmbeddedProcesses embedded;

  @Menu
  RemoteMenu workflow =
      new RemoteMenu(consoleUrl() + "/_workflow").withLabel("Workflow").withPath("/_workflow");

  static String consoleUrl() {
    return System.getProperty(
        "ec.console.url", System.getenv().getOrDefault("EC_CONSOLE_URL", "http://localhost:8620"));
  }

  @Title("Overview")
  @ReadOnly
  public static class Overview {
    String note = "The Workflow section is served by the EventConductor console, not by this shell.";
  }
}
