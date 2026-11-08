package io.mateu.explorer.examples.behaviour.commandcenter;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppShortcut;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Locale;

/**
 * {@code @App(commandCenter = true)}: an always-present round button (bottom-right) opens a
 * full-screen palette that unifies the whole menu, your records ({@link GlobalSearchSupplier}),
 * the recently visited screens and the quick-launch codes of {@code @AppShortcut} — the
 * touch-friendly, discoverable sibling of ⌘K (which stands down when the command center is on).
 */
@UI("/apps/command-center")
@Title("Command center demo")
@App(commandCenter = true)
@AppShortcut(route = "/rooms", label = "Rooms", code = "RMS")
public class CommandCenterDemoApp implements GlobalSearchSupplier {

  @Menu Rooms rooms;
  @Menu Guests guests;

  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var all =
        List.of(
            new GlobalSearchResult("Room 204", "Sea view, double", "/rooms", "Rooms"),
            new GlobalSearchResult("Ada Lovelace", "Checked in, room 204", "/guests", "Guests"));
    var text = searchText == null ? "" : searchText.toLowerCase(Locale.ROOT);
    return all.stream().filter(r -> r.label().toLowerCase(Locale.ROOT).contains(text)).toList();
  }

  @Title("Rooms")
  @ReadOnly
  public static class Rooms {
    String hint = "Open the command center with the round button at the bottom right.";
  }

  @Title("Guests")
  @ReadOnly
  public static class Guests {
    String hint = "Reached through the command center.";
  }
}
