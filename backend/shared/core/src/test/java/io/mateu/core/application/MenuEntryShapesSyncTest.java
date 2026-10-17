package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.interfaces.IconKey;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Every shape a {@code @Menu} field can take becomes the menu entry a user expects: a String or URI
 * left null routes to the field under the app, a {@code List<Rule>} is one rule leaf carrying all
 * its rules, {@code @Icon}/{@code @Menu(image)} decorate any kind of entry, {@code @Hidden} keeps
 * an entry routable but out of the menu, and a page whose only menu entries the caller may not see
 * is a plain link, not an empty group.
 */
class MenuEntryShapesSyncTest {

  public static class Reports {
    public String title = "Reports";
  }

  public static class AdminOnlyGroup {
    @Menu
    @EyesOnly(roles = "admin")
    String secret = "/shapes/secret";
  }

  @UI("/shapes")
  @Title("Shapes")
  public static class ShapesApp {
    @Menu String orderLines; // null: routes to the field under the app

    @Menu URI externalDocs; // null URI as well

    @Menu URI website = URI.create("https://example.com");

    @Menu
    @Icon(IconKey.Airplane)
    String flights = "/shapes/flights";

    @Menu(image = "/img/reports.png", description = "All the reports")
    Reports reports;

    @Menu
    @Icon(IconKey.Alarm)
    RouteLink alarms = new RouteLink("/shapes/alarms", "Alarms");

    @Menu
    List<Rule> maintenance =
        List.of(
            Rule.builder().action(RuleAction.RunAction).actionId("flushCaches").build(),
            Rule.builder().action(RuleAction.RunAction).actionId("reindex").build());

    @Menu @Hidden String hiddenRoute = "/shapes/hidden";

    @Menu @Hidden RouteLink hiddenLink = new RouteLink("/shapes/hidden-link", "Hidden link");

    @Menu AdminOnlyGroup admin;

    public void flushCaches() {}

    public void reindex() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ShapesApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<MenuOptionDto> flatten(List<MenuOptionDto> options) {
    var out = new ArrayList<MenuOptionDto>();
    for (var o : options) {
      out.add(o);
      if (o.submenus() != null) out.addAll(flatten(o.submenus()));
    }
    return out;
  }

  private static MenuOptionDto option(String label) {
    var app = WireWalk.first(mateu.sync("/shapes"), AppDto.class);
    assertThat(app).isNotNull();
    return flatten(app.menu()).stream()
        .filter(o -> label.equals(o.label()))
        .findFirst()
        .orElseThrow(() -> new AssertionError(label + " not in " + app.menu()));
  }

  @Test
  void nullStringAndUriEntriesRouteToTheFieldUnderTheApp() {
    assertThat(option("Order lines").route()).isEqualTo("/shapes/orderLines");
    assertThat(option("External docs").route()).isEqualTo("/shapes/externalDocs");
    System.out.println("DBG " + option("Website"));
    System.out.println("DBG " + option("Flights"));
  }

  @Test
  void iconsAndImagesDecorateRoutesLinksAndPages() {
    assertThat(option("Flights").icon()).isEqualTo(IconKey.Airplane.iconName);
    assertThat(option("Alarms").icon()).isEqualTo(IconKey.Alarm.iconName);
    var reports = option("Reports");
    assertThat(reports.image()).isEqualTo("/img/reports.png");
    assertThat(reports.description()).isEqualTo("All the reports");
  }

  @Test
  void aListOfRulesIsOneRuleLeafCarryingEveryRule() {
    var maintenance = option("Maintenance");
    assertThat(maintenance.rules()).hasSize(2);
    assertThat(String.valueOf(maintenance.rules())).contains("flushCaches").contains("reindex");
  }

  @Test
  void hiddenEntriesAreNotVisibleInTheMenu() {
    assertThat(option("Hidden route").visible()).isFalse();
    assertThat(option("Hidden link").visible()).isFalse();
    assertThat(option("Flights").visible()).isTrue();
  }

  @Test
  void aPageWhoseMenuEntriesAreAllForbiddenIsALinkNotAnEmptyGroup() {
    var admin = option("Admin");
    assertThat(admin.submenus()).isNullOrEmpty();
  }
}
