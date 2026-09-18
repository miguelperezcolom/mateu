package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Pins the coherence-plan decision #4: a ModelView method that returns an object which is NOT a
 * recognized effect type (not a route/command/message/banner/State/Data/component) is <b>rendered
 * as UI</b> — reflected into a component and returned as a fragment. This is already the behaviour
 * (`FragmentListMapper`'s fallback maps the instance to a component); this test guards it as a
 * contract so the "unrecognized object → render as UI" default cannot regress silently.
 *
 * <p>Note this only bites for a <em>truly unrecognized</em> return: the recognized effect kinds
 * (route → navigate, command, message/banner, State/Data) are handled as their own effects and
 * known flows (AutoCrud, etc.) return explicitly.
 */
class ReturnRendersAsUiSyncTest {

  @SuppressWarnings("unused")
  @UI("/return-render")
  public static class ReturnRenderForm {
    String name = "n";

    /** Returns a plain domain object — not a Mateu effect type — so it must render as UI. */
    @Action
    Object showReport() {
      return new Report();
    }

    /** A plain POJO Mateu does not recognize as an effect: its fields must become form fields. */
    public static class Report {
      public String title = "Q3";
      public int total = 42;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ReturnRenderForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anUnrecognizedReturnedObjectIsRenderedAsUi() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/return-render")
                .actionId("showReport")
                .serverSideType(ReturnRenderForm.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of())
                .build());

    assertThat(increment.fragments())
        .as("a returned unrecognized object should render as a UI fragment")
        .isNotEmpty();

    // Its fields reached the wire as form fields → it was reflected into UI, not dropped or treated
    // as opaque data.
    var tree = mateu.context().getBean(ObjectMapper.class).valueToTree(increment);
    assertThat(tree.findValuesAsText("fieldId"))
        .as("the object's fields should have become form fields")
        .contains("title", "total");
  }
}
