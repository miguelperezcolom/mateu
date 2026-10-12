package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A card menu ({@code presentation: {display: cards}} on a group, {@code description} + {@code
 * presentation: {icon|image}} on its entries) authored on a {@code type: AppShell} reaches the wire
 * exactly as {@code @Menu(display = cards)} does ({@link MenuCardsSyncTest}): display "cards" on
 * the group, the look on each entry, and a nested group's entries as the card's actions.
 *
 * <p>Fixture {@code mount-home/card-menus/specs/ui}. Also the Java golden of the browser expander
 * ({@code expandAppShellCardMenus.test.ts}): run with {@code -Dmateu.golden.write=true} to refresh
 * {@code app-shell-card-menus.golden.json}.
 */
class YamlCardMenusSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  private static UIIncrementDto loadShell() {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "card-menus", YamlCardMenusSyncTest.class.getClassLoader()));
    try (var mateu = TestMateu.withUis()) {
      return mateu.run(
          RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build());
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static AppDto appOf(UIIncrementDto increment) {
    var component = (ClientSideComponentDto) increment.fragments().get(0).component();
    return (AppDto) component.metadata();
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
  void aYamlCardsGroupCarriesItsDisplayAndEachCardItsLook() throws Exception {
    var increment = loadShell();
    var menu = appOf(increment).menu();

    var group = find(menu, "Quick access");
    assertThat(group.display()).isEqualTo("cards");
    assertThat(group.submenus())
        .extracting(MenuOptionDto::label)
        .containsExactly("Check-in", "Floor plan", "Billing");

    var checkIn = find(menu, "Check-in");
    assertThat(checkIn.description()).isEqualTo("Sign the registration card and scan the ID");
    assertThat(checkIn.icon()).isEqualTo("vaadin:clipboard");
    assertThat(checkIn.image()).isNull();
    assertThat(checkIn.display()).isNull();
    assertThat(checkIn.route()).isEqualTo("/check-in");

    var floorPlan = find(menu, "Floor plan");
    assertThat(floorPlan.description()).isEqualTo("Rooms coloured by housekeeping status");
    assertThat(floorPlan.image()).isEqualTo("/img/floor.png");
    assertThat(floorPlan.icon()).isNull();

    // a group inside the cards group is not a destination: its entries are the card's actions
    var billing = find(menu, "Billing");
    assertThat(billing.description()).isEqualTo("Folios, charges and payments");
    assertThat(billing.icon()).isEqualTo("vaadin:invoice");
    assertThat(billing.submenus())
        .extracting(MenuOptionDto::label)
        .containsExactly("Folio", "New booking");
    assertThat(billing.submenus())
        .extracting(MenuOptionDto::route)
        .containsExactly("/billing", "/bookings/new");

    maybeWriteGolden(increment);
  }

  @Test
  void aPlainYamlEntryTravelsAsBefore() {
    var home = find(appOf(loadShell()).menu(), "Home");
    assertThat(home.display()).isNull();
    assertThat(home.image()).isNull();
    assertThat(home.icon()).isNull();
    assertThat(home.description()).isNull();
  }

  private static void maybeWriteGolden(UIIncrementDto increment) throws Exception {
    if (!Boolean.getBoolean("mateu.golden.write")) return;
    var target =
        Path.of(
            "../../../frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__/app-shell-card-menus.golden.json");
    Files.writeString(
        target,
        JSON.writerWithDefaultPrettyPrinter().writeValueAsString(JSON.valueToTree(increment))
            + "\n");
  }
}
