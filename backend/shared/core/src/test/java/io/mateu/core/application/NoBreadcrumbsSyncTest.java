package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.NoBreadcrumbs;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The automatic breadcrumb trail is the renderer's to build (from the shell's menu and the route);
 * what travels is only the page saying it wants none: {@code @NoBreadcrumbs} sets {@code
 * noBreadcrumbs} on the page, and a page that says nothing leaves it null.
 */
class NoBreadcrumbsSyncTest {

  @SuppressWarnings("unused")
  @UI("/with-crumbs")
  @Title("With")
  public static class WithCrumbs {
    String name;
  }

  @SuppressWarnings("unused")
  @UI("/without-crumbs")
  @Title("Without")
  @NoBreadcrumbs
  public static class WithoutCrumbs {
    String name;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(WithCrumbs.class, WithoutCrumbs.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static PageDto pageOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        var pages = new ArrayList<PageDto>();
        FieldKindsSyncTest.walk(server, PageDto.class, pages);
        assertThat(pages).isNotEmpty();
        return pages.get(0);
      }
    }
    throw new AssertionError("no server side component for " + route);
  }

  @Test
  void aPageThatSaysNothingLeavesTheTrailToTheRenderer() {
    assertThat(pageOf("/with-crumbs").noBreadcrumbs()).isNull();
  }

  @Test
  void noBreadcrumbsTravelsOnThePage() {
    assertThat(pageOf("/without-crumbs").noBreadcrumbs()).isTrue();
  }
}
