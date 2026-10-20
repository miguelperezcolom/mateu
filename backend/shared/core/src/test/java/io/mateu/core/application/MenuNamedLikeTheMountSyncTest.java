package io.mateu.core.application;

import static io.mateu.core.application.NonRootAppMenuSyncTest.appOf;
import static io.mateu.core.application.NonRootAppMenuSyncTest.entryRoutedTo;
import static io.mateu.core.application.NonRootAppMenuSyncTest.screenOf;
import static io.mateu.core.application.NonRootAppMenuSyncTest.selected;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.Submenu;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * A submenu called like the mount: {@code @UI("/library")} with {@code @Menu LibraryMenu library}
 * (the workshop's {@code /biblioteca} + {@code MenuBiblioteca biblioteca}). Its page lives at
 * {@code /library/catalog} relative to the mount — {@code /library/library/catalog} as a URL path —
 * and a menu click, a deep link and a reload must all land on it, not on the app again.
 */
class MenuNamedLikeTheMountSyncTest {

  static final String CATALOG = MenuNamedLikeTheMountSyncTest.Catalog.class.getName();

  @Title("Catalog")
  public static class Catalog {
    String value = "catalog";
  }

  public static class LibraryMenu implements Submenu {
    @Menu Catalog catalog;
  }

  @UI("/library")
  @Title("Library")
  public static class LibraryApp {
    @Menu LibraryMenu library;
  }

  static TestMateu mateu;
  static NonRootAppMenuSyncTest.Mount mount;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(LibraryApp.class);
    mount = new NonRootAppMenuSyncTest.Mount(mateu, LibraryApp.class, "/library");
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aMenuClickLoadsThePage() {
    var option = entryRoutedTo(appOf(mount.shell("")).orElseThrow(), "/library/catalog");
    assertThat(screenOf(mount.content(option.route(), option.consumedRoute()))).isEqualTo(CATALOG);
  }

  @ParameterizedTest
  @ValueSource(strings = {"/library/catalog", "/library/library/catalog"})
  void aDeepLinkOrReloadLandsOnThePage(String route) {
    var app = appOf(mount.shell(route)).orElseThrow();
    assertThat(app.homeRoute()).isEqualTo("/library/catalog");
    assertThat(selected(app)).isNotEmpty();
    assertThat(screenOf(mount.content(app.homeRoute(), app.homeConsumedRoute())))
        .isEqualTo(CATALOG);
  }

  @ParameterizedTest
  @ValueSource(strings = {"/library/catalog", "/library/library/catalog"})
  void aContentLoadLandsOnThePage(String route) {
    assertThat(screenOf(mount.content(route, ""))).isEqualTo(CATALOG);
  }
}
