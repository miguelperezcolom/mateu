package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.BackLink;
import io.mateu.uidl.fluent.AppShell;
import org.junit.jupiter.api.Test;

/** A data-authored shell (no class, so no {@code @App}) decides its own back link. */
class AppShellBackLinkTest {

  @Test
  void aShellsOwnBackLinkDecides() {
    assertThat(AppMapper.backLinkParent(AppShell.builder().backLink(BackLink.PARENT).build()))
        .isTrue();
    assertThat(AppMapper.backLinkParent(AppShell.builder().backLink(BackLink.BREADCRUMBS).build()))
        .isFalse();
    assertThat(AppMapper.backLinkParent(AppShell.builder().build())).isFalse();
  }
}
