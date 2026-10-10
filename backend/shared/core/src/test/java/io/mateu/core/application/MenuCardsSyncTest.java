package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MenuDisplay;
import io.mateu.uidl.interfaces.IconKey;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A menu group that opens as a panel of CARDS ({@code @Menu(display = cards)}): the group carries
 * display "cards"; each entry its title, description, icon and image, and its own children (the
 * card's actions). A plain menu travels exactly as before (no display, no image).
 */
class MenuCardsSyncTest {

  @Title("Reservations")
  public static class ReservationsPage {
    public String name = "reservations";
  }

  @Title("New reservation")
  public static class NewReservationPage {
    public String name = "new";
  }

  @Title("Room diary")
  public static class RoomDiaryPage {
    public String name = "diary";
  }

  public static class ReservationActions {
    @Menu ReservationsPage search;
    @Menu NewReservationPage create;
  }

  public static class BookingsCards {
    @Menu(description = "Search, create and modify reservations", image = "/img/res.png")
    @Icon(IconKey.Calendar)
    ReservationActions reservations;

    @Menu(description = "Rooms by day, drag to move a stay")
    RoomDiaryPage roomDiary;
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("PMS")
  public static class Root {
    @Menu(display = MenuDisplay.cards)
    BookingsCards bookings;

    @Menu RoomDiaryPage plain;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Root.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static AppDto app() {
    var increment =
        mateu.run(RunActionRqDto.builder().route("").consumedRoute("_empty").actionId("").build());
    for (var fragment : increment.fragments()) {
      var found = findApp(fragment.component());
      if (found != null) return found;
    }
    return null;
  }

  private static AppDto findApp(ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) return app;
      for (var child : cs.children()) {
        var found = findApp(child);
        if (found != null) return found;
      }
    }
    return null;
  }

  private static MenuOptionDto find(List<MenuOptionDto> menu, String label) {
    for (var option : menu) {
      if (label.equals(option.label())) return option;
      var found = find(option.submenus(), label);
      if (found != null) return found;
    }
    return null;
  }

  @Test
  void aCardsGroupCarriesItsDisplayAndEachCardItsLook() {
    var menu = app().menu();
    var group = find(menu, "Bookings");
    assertThat(group.display()).isEqualTo("cards");
    var card = find(group.submenus(), "Reservations");
    assertThat(card.description()).isEqualTo("Search, create and modify reservations");
    assertThat(card.image()).isEqualTo("/img/res.png");
    assertThat(card.icon()).isNotBlank();
    // the card's own children are its actions
    assertThat(card.submenus())
        .extracting(MenuOptionDto::label)
        .containsExactly("Search", "Create");
    var leafCard = find(group.submenus(), "Room diary");
    assertThat(leafCard.description()).isEqualTo("Rooms by day, drag to move a stay");
    assertThat(leafCard.submenus()).isEmpty();
  }

  @Test
  void aPlainEntryTravelsAsBefore() {
    var plain = find(app().menu(), "Plain");
    assertThat(plain.display()).isNull();
    assertThat(plain.image()).isNull();
    assertThat(plain.icon()).isNull();
  }
}
