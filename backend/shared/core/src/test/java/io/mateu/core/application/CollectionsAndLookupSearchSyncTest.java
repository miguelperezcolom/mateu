package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Typed-collection hydration from wire values (CollectionValueConverter) and the @Lookup
 * options-search action (search-&lt;field&gt;).
 */
class CollectionsAndLookupSearchSyncTest {

  @SuppressWarnings("unused")
  public enum Tag {
    RED,
    BLUE
  }

  @SuppressWarnings("unused")
  @UI("/baskets")
  public static class BasketForm {
    List<Integer> counts = new ArrayList<>();
    List<Double> weights = new ArrayList<>();
    List<Tag> tags = new ArrayList<>();
    List<String> names = new ArrayList<>();

    static BasketForm seen;

    @Action
    void snap(HttpRequest httpRequest) {
      seen = this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BasketForm.class, RunnersAndMasterDetailSyncTest.BookingForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── typed collection hydration ──────────────────────────────────────────────

  @Test
  void integerListsHydrateFromStrings() {
    BasketForm.seen = null;
    snap(Map.of("counts", List.of("1", "2", 3)));
    assertThat(BasketForm.seen.counts).containsExactly(1, 2, 3);
  }

  @Test
  void doubleListsHydrateFromStringsAndIntegers() {
    BasketForm.seen = null;
    snap(Map.of("weights", List.of("1.5", 2, 2.5)));
    assertThat(BasketForm.seen.weights).containsExactly(1.5, 2.0, 2.5);
  }

  @Test
  void enumListsHydrateFromNames() {
    BasketForm.seen = null;
    snap(Map.of("tags", List.of("RED", "BLUE")));
    assertThat(BasketForm.seen.tags).containsExactly(Tag.RED, Tag.BLUE);
  }

  @Test
  void stringListsPassThrough() {
    BasketForm.seen = null;
    snap(Map.of("names", List.of("a", "b")));
    assertThat(BasketForm.seen.names).containsExactly("a", "b");
  }

  private void snap(Map<String, Object> state) {
    mateu.run(
        RunActionRqDto.builder()
            .route("/baskets")
            .actionId("snap")
            .serverSideType(BasketForm.class.getName())
            .componentState(state)
            .initiatorComponentId("bf_app")
            .build());
  }

  // ── @Lookup options search ──────────────────────────────────────────────────

  @Test
  void lookupSearchActionReturnsTheOptions() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/booking")
                .actionId("search-destination")
                .serverSideType(RunnersAndMasterDetailSyncTest.BookingForm.class.getName())
                .componentState(Map.of())
                .parameters(Map.of("searchText", "", "page", 0, "size", 10))
                .initiatorComponentId("bk_app")
                .build());
    assertThat(increment).isNotNull();
    assertThat(increment.fragments()).isNotEmpty();
  }
}
