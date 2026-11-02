package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.fluent.Form;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** How a definition-only page names the window (ActionInstanceCreator.nameTheWindow). */
class DefinitionWindowTitleTest {

  @Test
  void aTitleReadingTheStateIsInterpolated() {
    var form = Form.builder().title("Customer ${state.name}").build();
    assertThat(ActionInstanceCreator.definitionTitle(form, Map.of("name", "Ada")))
        .isEqualTo("Customer Ada");
  }

  @Test
  void aTitleWhoseValueIsNotKnownYetGivesWayToTheRoute() {
    var form = Form.builder().title("Customer ${state.name}").build();
    assertThat(ActionInstanceCreator.definitionTitle(form, Map.of())).isNull();
    assertThat(ActionInstanceCreator.humanizedRoute("/customers/:id/edit-notes?x=1"))
        .isEqualTo("Edit notes");
  }

  @Test
  void aRecordRouteNeverNamesTheWindowByItsId() {
    // the crawl saw tabs titled "6", "52": the fallback humanized the concrete path
    assertThat(ActionInstanceCreator.humanizedRoute("missions/:id")).isEqualTo("Missions");
    assertThat(ActionInstanceCreator.humanizedRoute("/missions/6")).isEqualTo("Missions");
    assertThat(ActionInstanceCreator.humanizedRoute("missions/:id/edit")).isEqualTo("Edit");
  }
}
