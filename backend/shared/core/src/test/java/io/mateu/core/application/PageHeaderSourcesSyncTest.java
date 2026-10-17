package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.PageDto;
import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.Named;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Where a page's browser-tab title, header title, favicon and css classes come from: a {@link
 * PageTitleSupplier} wins over {@code @PageTitle}; a {@link Named} view is titled by its name;
 * {@code @FavIcon} and {@code @CssClasses} reach the page as declared.
 */
class PageHeaderSourcesSyncTest {

  @UI("/page-header-supplied")
  @PageTitle("Static tab title")
  public static class Supplied implements PageTitleSupplier {
    public String name = "x";

    @Override
    public String pageTitle() {
      return "Booking 42 — Hotel";
    }
  }

  @UI("/page-header-annotated")
  @PageTitle("Reports — Hotel")
  @FavIcon("/img/reports.ico")
  @CssClasses("dense reports")
  public static class Annotated {
    public String name = "x";
  }

  @UI("/page-header-named")
  public static class NamedView implements Named {
    public String code = "x";

    @Override
    public String id() {
      return "101";
    }

    @Override
    public String name() {
      return "Suite 101";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Supplied.class, Annotated.class, NamedView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static PageDto page(String route) {
    var pages =
        FieldKindsSyncTest.collect(mateu.sync(route).fragments().get(0).component(), PageDto.class);
    assertThat(pages).as("a page at " + route).isNotEmpty();
    return pages.get(0);
  }

  @Test
  void theSupplierWinsOverTheAnnotationForTheTabTitle() {
    assertThat(page("/page-header-supplied").pageTitle()).isEqualTo("Booking 42 — Hotel");
  }

  @Test
  void annotatedTabTitleFaviconAndCssClassesReachThePage() {
    var page = page("/page-header-annotated");
    assertThat(page.pageTitle()).isEqualTo("Reports — Hotel");
    assertThat(page.favicon()).isEqualTo("/img/reports.ico");
    assertThat(String.valueOf(mateu.sync("/page-header-annotated")))
        .contains("cssClasses=dense reports");
  }

  @Test
  void aNamedViewIsTitledByItsName() {
    var page = page("/page-header-named");
    assertThat(page.pageTitle() + " " + page.title()).contains("Suite 101");
  }
}
