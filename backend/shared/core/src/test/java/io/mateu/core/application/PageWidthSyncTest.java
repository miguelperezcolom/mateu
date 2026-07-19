package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The page width (the first parameter of the Oracle Redwood page templates) travels on the wire:
 * {@code @PageWidth} sets it explicitly, the {@code PageWidthSupplier} hook lets archetypes declare
 * their default ({@link Foldout} is edge-to-edge), the annotation on the concrete view wins over
 * the archetype's hook, and when neither says anything {@code pageWidth} is {@code null} so the
 * renderer infers it from the content (defaulting to fixed).
 */
class PageWidthSyncTest {

  // ---------------------------------------------------------------- fixtures

  @SuppressWarnings("unused")
  @UI("/plain-page")
  @Title("Plain")
  public static class PlainPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("body", "a plain page");
    }
  }

  @SuppressWarnings("unused")
  @UI("/fixed-page")
  @Title("Fixed")
  @PageWidth(PageWidthStyle.FIXED)
  public static class FixedPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("body", "a fixed-width page");
    }
  }

  @SuppressWarnings("unused")
  @UI("/full-page")
  @Title("Full")
  @PageWidth(PageWidthStyle.FULL_WIDTH)
  public static class FullPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("body", "a full-width page");
    }
  }

  @SuppressWarnings("unused")
  @UI("/fold-page")
  @Title("Fold")
  public static class FoldPage extends Foldout {
    Markdown overview = new Markdown("the overview", null, null);

    @Panel(title = "Notes")
    Markdown notes = new Markdown("some notes", null, null);
  }

  @SuppressWarnings("unused")
  @UI("/fixed-fold-page")
  @Title("Fixed fold")
  @PageWidth(PageWidthStyle.FIXED)
  public static class FixedFoldPage extends Foldout {
    Markdown overview = new Markdown("the overview", null, null);

    @Panel(title = "Notes")
    Markdown notes = new Markdown("some notes", null, null);
  }

  @SuppressWarnings("unused")
  @UI("/full-form")
  @Title("Full form")
  @PageWidth(PageWidthStyle.FULL_WIDTH)
  public static class FullForm {
    String name;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            PlainPage.class,
            FixedPage.class,
            FullPage.class,
            FoldPage.class,
            FixedFoldPage.class,
            FullForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ---------------------------------------------------------------- assertions

  private static ServerSideComponentDto serverSideOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        return server;
      }
    }
    throw new AssertionError("no server side component for " + route);
  }

  private static String pageWidthOf(String route) {
    return serverSideOf(route).pageWidth();
  }

  @Test
  void annotatedFixedWidthTravelsOnTheWire() {
    assertThat(pageWidthOf("/fixed-page")).isEqualTo("fixed");
  }

  @Test
  void annotatedFullWidthTravelsOnTheWire() {
    assertThat(pageWidthOf("/full-page")).isEqualTo("fullWidth");
  }

  @Test
  void unannotatedPageLeavesTheWidthNullSoTheRendererInfers() {
    assertThat(pageWidthOf("/plain-page")).isNull();
  }

  @Test
  void foldoutDeclaresEdgeToEdgeThroughTheSupplierHook() {
    assertThat(pageWidthOf("/fold-page")).isEqualTo("edgeToEdge");
  }

  @Test
  void theAnnotationWinsOverTheArchetypeHook() {
    assertThat(pageWidthOf("/fixed-fold-page")).isEqualTo("fixed");
  }

  @Test
  void aReflectedFormCarriesTheWidthBothOnTheEnvelopeAndOnThePageMetadata() {
    assertThat(pageWidthOf("/full-form")).isEqualTo("fullWidth");
    var pages = new ArrayList<PageDto>();
    FieldKindsSyncTest.walk(serverSideOf("/full-form"), PageDto.class, pages);
    assertThat(pages).isNotEmpty();
    assertThat(pages.get(0).pageWidth()).isEqualTo("fullWidth");
  }
}
