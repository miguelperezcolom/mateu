package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/** Primitive/enum array hydration (ArrayValueConverter) and URL lists. */
class ArraysAndUrlsSyncTest {

  @SuppressWarnings("unused")
  public enum Flag {
    ON,
    OFF
  }

  @SuppressWarnings("unused")
  @UI("/arrays")
  public static class ArraysForm {
    boolean[] switches;
    int[] counts;
    double[] ratios;
    Flag[] flags;
    List<URL> links = new ArrayList<>();

    static ArraysForm seen;

    @Action
    void snap(HttpRequest httpRequest) {
      seen = this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ArraysForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private void snap(Map<String, Object> state) {
    ArraysForm.seen = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/arrays")
            .actionId("snap")
            .serverSideType(ArraysForm.class.getName())
            .componentState(state)
            .initiatorComponentId("ar_app")
            .build());
    assertThat(ArraysForm.seen).isNotNull();
  }

  @Test
  void booleanArraysHydrate() {
    snap(Map.of("switches", List.of(true, false, true)));
    assertThat(ArraysForm.seen.switches).containsExactly(true, false, true);
  }

  @Test
  void intArraysHydrateFromMixedValues() {
    snap(Map.of("counts", List.of(1, "2", 3)));
    assertThat(ArraysForm.seen.counts).containsExactly(1, 2, 3);
  }

  @Test
  void doubleArraysHydrateFromMixedValues() {
    snap(Map.of("ratios", List.of(1.5, 2, "3.5")));
    assertThat(ArraysForm.seen.ratios).containsExactly(1.5, 2.0, 3.5);
  }

  @Test
  void enumArraysHydrateFromNames() {
    snap(Map.of("flags", List.of("ON", "OFF")));
    assertThat(ArraysForm.seen.flags).containsExactly(Flag.ON, Flag.OFF);
  }

  @Test
  void urlListsHydrateFromStrings() {
    snap(Map.of("links", List.of("https://mateu.io", "https://example.com")));
    assertThat(ArraysForm.seen.links).hasSize(2);
    assertThat(ArraysForm.seen.links.get(0).getHost()).isEqualTo("mateu.io");
  }

  @Test
  void invalidUrlsAreDroppedNotFatal() {
    snap(Map.of("links", List.of("https://ok.example", "not a url")));
    assertThat(ArraysForm.seen.links).hasSize(1);
  }
}
