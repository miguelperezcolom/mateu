package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** A sort read off a URL ({@code ?sort=name:asc}) is a direction, not a failed search. */
class DirectionTest {

  @Test
  void readsTheLongAndTheShortSpellingInAnyCase() {
    assertThat(Direction.parse("ascending")).isEqualTo(Direction.ascending);
    assertThat(Direction.parse("asc")).isEqualTo(Direction.ascending);
    assertThat(Direction.parse("DESC")).isEqualTo(Direction.descending);
    assertThat(Direction.parse(" descending ")).isEqualTo(Direction.descending);
  }

  @Test
  void anythingElseIsAscending() {
    assertThat(Direction.parse(null)).isEqualTo(Direction.ascending);
    assertThat(Direction.parse("sideways")).isEqualTo(Direction.ascending);
  }
}
