package io.mateu.core.infra.declarative.orchestrators.crud;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.FoldoutDetail;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import org.junit.jupiter.api.Test;

/**
 * A crud's detail is capped at 900px unless it asks for more: a foldout detail and a full or
 * edge-to-edge page take the whole content column, as Redwood draws them; an explicit style wins.
 */
class CrudStyleForViewTest {

  static class Plain {
    @Section("A")
    String a;
  }

  @FoldoutDetail
  static class Foldout {
    @Section("A")
    String a;
  }

  @PageWidth(PageWidthStyle.EDGE_TO_EDGE)
  static class EdgeToEdge {
    String a;
  }

  @PageWidth(PageWidthStyle.FIXED)
  static class Fixed {
    String a;
  }

  @FoldoutDetail
  @Style("max-width: 600px;")
  static class Styled {
    String a;
  }

  @Test
  void aPlainDetailKeepsTheFixedContainer() {
    assertThat(CrudOrchestratorMetadata.styleForView(Plain.class, Plain.class))
        .isEqualTo("max-width:900px;margin: auto;");
    assertThat(CrudOrchestratorMetadata.styleForView(Fixed.class, Fixed.class))
        .isEqualTo("max-width:900px;margin: auto;");
  }

  @Test
  void aFoldoutOrAWidePageTakesTheWholeColumn() {
    assertThat(CrudOrchestratorMetadata.styleForView(Foldout.class, Plain.class))
        .isEqualTo("width: 100%;");
    assertThat(CrudOrchestratorMetadata.styleForView(EdgeToEdge.class, Plain.class))
        .isEqualTo("width: 100%;");
    assertThat(CrudOrchestratorMetadata.styleForView(Plain.class, EdgeToEdge.class))
        .isEqualTo("width: 100%;");
  }

  @Test
  void anExplicitStyleWins() {
    assertThat(CrudOrchestratorMetadata.styleForView(Styled.class, Plain.class))
        .isEqualTo("max-width: 600px;");
  }
}
