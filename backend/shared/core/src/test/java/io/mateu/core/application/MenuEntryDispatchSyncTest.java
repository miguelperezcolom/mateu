package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AnchorDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.NotFoundDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.Submenu;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * What a click on each kind of {@code @Menu} entry loads into the content slot of an app shell: a
 * field holding a page, a {@code Supplier}/{@code Function} computing one, a menu GROUP (a section
 * index listing its children instead of "Not found") — the request the shell sends is the entry's
 * route with the app as {@code consumedRoute}.
 */
class MenuEntryDispatchSyncTest {

  @Title("Greeting")
  public static class GreetingPage implements PostHydrationHandler {
    public String message = "hello";

    @Override
    public void onHydrated(HttpRequest httpRequest) {
      message = "hydrated";
    }
  }

  @SuppressWarnings("unused")
  public static class ReportsGroup implements Submenu {
    @Menu String sales = "/covnav/reports/sales";

    @Menu String stock = "/covnav/reports/stock";
  }

  /** A launches group whose «All launches» entry names the group's own route. */
  @SuppressWarnings("unused")
  public static class LaunchesGroup implements Submenu {
    @Menu String calendar = "/covnav/launches/calendar";

    @Menu String all = "/covnav/launches";
  }

  /** The page the «All launches» entry goes to: the group's own route. */
  @UI("/covnav/launches")
  @Title("All launches")
  public static class AllLaunchesPage {
    public String message = "all launches";
  }

  @SuppressWarnings("unused")
  @UI("/covnav")
  @Title("Nav app")
  public static class NavApp {
    @Menu ReportsGroup reports;

    @Menu LaunchesGroup launches;

    @Menu Supplier<Object> supplied = GreetingPage::new;

    @Menu Function<HttpRequest, Object> computed = rq -> new GreetingPage();

    @Menu GreetingPage page;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(NavApp.class, AllLaunchesPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** What the shell sends when an entry is clicked: the entry route, the app consumed. */
  static UIIncrementDto click(String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/covnav")
            .serverSideType(NavApp.class.getName())
            .actionId("")
            .build());
  }

  static ServerSideComponentDto content(UIIncrementDto increment) {
    assertThat(increment.fragments()).isNotEmpty();
    var component = increment.fragments().get(0).component();
    assertThat(component).isInstanceOf(ServerSideComponentDto.class);
    return (ServerSideComponentDto) component;
  }

  @SuppressWarnings("unchecked")
  static Object stateOf(UIIncrementDto increment, String key) {
    return ((Map<String, Object>) increment.fragments().get(0).state()).get(key);
  }

  static <T> List<T> all(ComponentDto component, Class<T> type) {
    var found = new ArrayList<T>();
    collect(component, type, found);
    return found;
  }

  private static <T> void collect(ComponentDto component, Class<T> type, List<T> found) {
    if (component instanceof ClientSideComponentDto client) {
      if (type.isInstance(client.metadata())) {
        found.add(type.cast(client.metadata()));
      }
      client.children().forEach(child -> collect(child, type, found));
    }
    if (component instanceof ServerSideComponentDto server) {
      server.children().forEach(child -> collect(child, type, found));
    }
  }

  @Test
  void aFieldHoldingAPageLoadsThatPageHydrated() {
    var increment = click("/covnav/page");
    assertThat(content(increment).serverSideType()).isEqualTo(GreetingPage.class.getName());
    assertThat(stateOf(increment, "message"))
        .as("a PostHydrationHandler page is told it was hydrated")
        .isEqualTo("hydrated");
  }

  @Test
  void aSupplierEntryLoadsWhatItSupplies() {
    var increment = click("/covnav/supplied");
    assertThat(content(increment).serverSideType()).isEqualTo(GreetingPage.class.getName());
    assertThat(stateOf(increment, "message")).isEqualTo("hydrated");
  }

  @Test
  void aFunctionEntryIsCalledWithTheRequest() {
    var increment = click("/covnav/computed");
    assertThat(content(increment).serverSideType()).isEqualTo(GreetingPage.class.getName());
  }

  @Test
  void aMenuGroupRouteRendersASectionIndexOfItsChildren() {
    var increment = click("/covnav/reports");
    var component = increment.fragments().get(0).component();
    var page = all(component, PageDto.class);
    assertThat(page).singleElement().extracting(PageDto::title).isEqualTo("Reports");
    assertThat(all(component, AnchorDto.class))
        .extracting(AnchorDto::text, AnchorDto::url)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("Sales", "/covnav/reports/sales"),
            org.assertj.core.groups.Tuple.tuple("Stock", "/covnav/reports/stock"));
  }

  @Test
  void aRouteNoEntryClaimsIsNotFoundAndOffersTheWayBackToTheApp() {
    var increment = click("/covnav/nowhere");
    var notFound = all(increment.fragments().get(0).component(), NotFoundDto.class);
    assertThat(notFound).singleElement().extracting(NotFoundDto::backRoute).isEqualTo("/covnav");
  }

  /**
   * An entry naming its group's route explicitly ({@code @Menu String all = "/covnav/launches"} in
   * the {@code launches} group) wins over the group's derived route: the page, not the index.
   */
  @Test
  void aLeafClaimingTheGroupsRouteWinsOverTheSectionIndex() {
    var increment = click("/covnav/launches");
    var component = increment.fragments().get(0).component();
    assertThat(all(component, AnchorDto.class)).as("no section index").isEmpty();
    assertThat(content(increment).serverSideType()).isEqualTo(AllLaunchesPage.class.getName());
  }
}
