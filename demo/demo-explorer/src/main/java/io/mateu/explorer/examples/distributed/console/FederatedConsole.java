package io.mateu.explorer.examples.distributed.console;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.fluent.AppVariant;

/**
 * A SECOND app of the Explorer, mounted at {@code /fed}: an app shell whose menu is one local page
 * plus the menus of three other deployments, fetched at run time ({@code RemoteMenu}):
 *
 * <ul>
 *   <li>Inventory — the Java remote ({@code remotes/java-remote}, mount {@code /inventory});
 *   <li>Orders — the YAML-only remote ({@code remotes/yaml-remote}, mount {@code /orders});
 *   <li>Help Center — a static bundle with no backend: its baseUrl names its {@code manifest.json};
 *   <li>Reports — a Python remote ({@code remotes/python-remote}, FastAPI), when it runs.
 * </ul>
 *
 * Each remote has several top-level entries, so each lands in ONE group named like the RemoteMenu
 * (its label, under its path). The browser loads the remote screens from the remotes directly —
 * every remote lists this origin in {@code mateu.cors.allowed-origins}. The urls come from env vars
 * ({@link Remotes}), read per request like any field initializer.
 */
@UI("/fed")
@Title("Federated console")
@App(AppVariant.MENU_ON_TOP)
public class FederatedConsole {

  @Menu @Label("Welcome") ConsoleWelcome welcome;

  @Menu
  RemoteMenu inventory =
      new RemoteMenu(Remotes.java() + "/inventory").withLabel("Inventory").withPath("/inventory");

  @Menu
  RemoteMenu orders =
      new RemoteMenu(Remotes.yaml() + "/orders").withLabel("Orders").withPath("/orders");

  @Menu
  RemoteMenu help =
      new RemoteMenu(Remotes.staticBundle() + "/manifest.json").withLabel("Help Center").withPath("/help");

  /** Optional: the Python remote (FastAPI + mateu-ui). Absent when it is not running. */
  @Menu
  RemoteMenu reports = new RemoteMenu(Remotes.python()).withLabel("Reports").withPath("/reports");
}
