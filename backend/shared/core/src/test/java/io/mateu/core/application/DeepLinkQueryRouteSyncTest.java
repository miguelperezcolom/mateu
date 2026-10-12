package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A deep link to a mounted listing with its filters in the query string ({@code
 * /qbooks?genre=NOVEL}): the browser sends {@code "/?genre=NOVEL"} to the {@code /qbooks}
 * controller. The adapters that resolve by pattern (WebFlux, Quarkus, Helidon — the harness
 * registers the same pattern resolvers) read it as "/" once the query was off and answered the
 * APP's root ui: the wrong screen, and an empty one.
 */
class DeepLinkQueryRouteSyncTest {

  @UI("")
  @Title("Root")
  public static class RootUi {
    public String greeting = "hi";
  }

  public record Book(String id) {}

  @UI("/qbooks")
  @Title("Books")
  public static class QBooks implements Listing<Book> {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Book("b1")));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withCompiledRouteResolvers(RootUi.class, QBooks.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private String typeLoadedAt(String route) {
    var increment =
        mateu.runAt(
            "/qbooks",
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute("_empty")
                .actionId("")
                .initiatorComponentId("_ux")
                .build());
    return String.valueOf(increment);
  }

  @Test
  void theMountsRootWithAQueryStringIsTheMountNotTheAppRoot() {
    assertThat(typeLoadedAt("/?genre=NOVEL")).contains(QBooks.class.getName());
    assertThat(typeLoadedAt("/?genre=NOVEL")).doesNotContain(RootUi.class.getName());
  }

  @Test
  void theMountsRootWithoutAQueryStillResolves() {
    assertThat(typeLoadedAt("")).contains(QBooks.class.getName());
  }
}
