package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SlashesTest {

  private static final String[] SAMPLES = {
    "", "/", "//", "a", "/a", "a/", "/a/", "//a//b//", "a//b", "///x///", "a/b/c"
  };

  @Test
  void trimMatchesTheRegexItReplaces() {
    for (var s : SAMPLES) {
      assertThat(Slashes.trim(s)).as(s).isEqualTo(s.replaceAll("^/+", "").replaceAll("/+$", ""));
    }
    assertThat(Slashes.trim(null)).isEmpty();
  }

  @Test
  void trimTrailingMatchesTheRegexItReplaces() {
    for (var s : SAMPLES) {
      assertThat(Slashes.trimTrailing(s)).as(s).isEqualTo(s.replaceAll("/+$", ""));
    }
    assertThat(Slashes.trimTrailing(null)).isEmpty();
  }

  @Test
  void aLongInteriorRunOfSlashesIsLinear() {
    var route = "a" + "/".repeat(500_000) + "b";
    long start = System.nanoTime();
    assertThat(Slashes.trim(route)).hasSize(route.length());
    assertThat(Slashes.trimTrailing(route)).hasSize(route.length());
    assertThat((System.nanoTime() - start) / 1_000_000).isLessThan(1_000);
  }
}
