package io.mateu.explorer.examples.behaviour.chromeless;

import io.mateu.explorer.examples.behaviour.shellvariants.GuestsPage;
import io.mateu.explorer.examples.behaviour.shellvariants.RoomsPage;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Locale;

/**
 * {@code @App(chromeless = true)}: no navigation chrome at all — the content full-bleed and one
 * floating button, the COMMAND CENTER, which opens a full-screen palette: the whole menu, recent
 * screens and (with a {@link GlobalSearchSupplier}) the app's entities. {@code commandCenter =
 * true} alone adds the same button to an ordinary shell.
 */
@UI("/x/behaviour/chromeless")
@Title("Kiosk")
@App(chromeless = true)
public class KioskApp implements GlobalSearchSupplier {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase(Locale.ROOT);
    return List.of(
            new GlobalSearchResult("Ada Lovelace", "Room 214", "/x/behaviour/chromeless/guests", "Guests"),
            new GlobalSearchResult("Room 214", "Sea-view double", "/x/behaviour/chromeless/rooms", "Rooms"))
        .stream()
        .filter(r -> (r.label() + " " + r.description()).toLowerCase(Locale.ROOT).contains(text))
        .toList();
  }
}
