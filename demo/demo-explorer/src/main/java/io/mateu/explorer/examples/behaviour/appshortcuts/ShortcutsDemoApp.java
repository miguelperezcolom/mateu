package io.mateu.explorer.examples.behaviour.appshortcuts;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppShortcut;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

/**
 * App-wide keyboard shortcuts: each {@code @AppShortcut} goes to a route or runs an app action from
 * any screen; {@code ?} lists them; its {@code code} is a quick-launch code (type it in the command
 * center). A shortcut of the screen itself wins over the app's.
 */
@UI("/apps/shortcuts")
@Title("App shortcuts demo")
@App(commandCenter = true)
@AppShortcut(key = "alt+1", route = "/arrivals", label = "Arrivals", code = "ARR")
@AppShortcut(key = "alt+2", route = "/departures", label = "Departures", code = "DEP")
@AppShortcut(key = "alt+s", actionId = "syncNow", label = "Sync now", code = "SYNC")
public class ShortcutsDemoApp {

  @Menu Arrivals arrivals;
  @Menu Departures departures;

  public Message syncNow() {
    return Message.success("Synced (Alt+S)");
  }

  @Title("Arrivals")
  @ReadOnly
  public static class Arrivals {
    String hint = "Alt+2 → Departures, Alt+S → sync, ? → the list of shortcuts.";
  }

  @Title("Departures")
  @ReadOnly
  public static class Departures {
    String hint = "Alt+1 → Arrivals.";
  }
}
