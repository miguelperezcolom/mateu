package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The Explorer's "menus and routes in code" shape: a NON-root {@code @UI("/chain")} app whose menu
 * comes from a {@link MenuSupplier} and whose leaves open a route authored by a {@link
 * RouteEntrySupplier}. A supplier's routes are ABSOLUTE (a bean is not tied to a mount), so the
 * entry names the mount — {@code chain/hotels/:code} — and the mount-relative link {@code
 * /hotels/palma} sent to the {@code /chain} controller resolves it, path parameter included. The
 * Explorer authored the entry WITHOUT the mount ({@code hotels/:code}): that is a route of the ROOT
 * mount, and the app answered "Page not found" — pinned here so the rule stays visible.
 */
class SuppliedRouteUnderClassMountSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @UI("/chain")
  @App(AppVariant.MENU_ON_LEFT)
  public static class Chain implements MenuSupplier {
    @Override
    public List<Actionable> menu(HttpRequest httpRequest) {
      return List.of(
          new Menu("/hotels", "Hotels", List.of(new RouteLink("/hotels/palma", "Palma"))));
    }
  }

  public static class HotelPage implements TitleSupplier {
    public String code;

    @Override
    public String title() {
      return "Hotel " + code;
    }
  }

  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(RouteEntry.of("chain/hotels/:code", HotelPage.class.getName()));
    }
  }

  private TestMateu mateu;

  @BeforeEach
  void setUp() {
    mateu = TestMateu.withUisAndBeans(List.of(new Routes()), Chain.class);
  }

  @AfterEach
  void tearDown() {
    mateu.close();
  }

  private String content(String route) {
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("")
            .serverSideType(Chain.class.getName())
            .actionId("")
            .initiatorComponentId("ux_root")
            .build();
    try {
      var httpRequest = new FakeHttpRequest(rq).withAttribute("baseUrl", "/chain");
      httpRequest.setAttribute("uiId", Chain.class.getName());
      var result =
          mateu.service().runAction(Chain.class.getName(), rq, "/chain", httpRequest).blockFirst();
      return JSON.valueToTree(result).toString();
    } catch (Throwable t) {
      throw new AssertionError(t);
    }
  }

  @Test
  void aSuppliedRouteNamingTheMountOpensUnderIt() {
    var wire = content("/hotels/palma");
    assertThat(wire).doesNotContain("Page not found").contains("Hotel palma");
  }
}
