package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AnchorDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Navigation inside an app shell composed IN CODE ({@link AppSupplier}): a route entry loads the
 * routed page, a content entry renders the component its supplier builds, and a group's own route
 * renders an index of its children — separators left out, a remote child linked at its own route
 * and labelled by its path when it has no label.
 */
class CodeShellNavigationSyncTest {

  @UI("/orders")
  @Title("Orders")
  public static class OrdersPage {
    public String filter = "open";
  }

  @UI("")
  public static class CodeShell implements AppSupplier {
    @Override
    public AppShell getApp(HttpRequest httpRequest) {
      return AppShell.builder()
          .title("Code shell")
          .menu(
              List.of(
                  new RouteLink("/orders", "Orders"),
                  new ContentLink("/welcome", "Welcome", rq -> new Text("Hello from code")),
                  new Menu(
                      "/admin",
                      "",
                      List.of(
                          new RouteLink("/users", "Users"),
                          new MenuSeparator(),
                          new RemoteMenu("/_audit", "/audit").withPath("/audit-log")))))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CodeShell.class, OrdersPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static UIIncrementDto click(String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("")
            .serverSideType(CodeShell.class.getName())
            .actionId("")
            .build());
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
  void aRouteEntryLoadsTheRoutedPage() {
    var content = (ServerSideComponentDto) click("/orders").fragments().get(0).component();
    assertThat(content.serverSideType()).isEqualTo(OrdersPage.class.getName());
  }

  @Test
  void aContentEntryRendersWhatItsSupplierBuilds() {
    var component = click("/welcome").fragments().get(0).component();
    assertThat(all(component, TextDto.class)).extracting(TextDto::text).contains("Hello from code");
  }

  @Test
  void aGroupRouteIsAnIndexOfItsChildren() {
    var component = click("/admin").fragments().get(0).component();
    assertThat(all(component, PageDto.class))
        .singleElement()
        .as("an unlabelled group is titled by its segment")
        .extracting(PageDto::title)
        .isEqualTo("Admin");
    assertThat(all(component, AnchorDto.class))
        .extracting(AnchorDto::text, AnchorDto::url)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("Users", "/admin/users"),
            org.assertj.core.groups.Tuple.tuple("Audit log", "/audit"));
  }
}
