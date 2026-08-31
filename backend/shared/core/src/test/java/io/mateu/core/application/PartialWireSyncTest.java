package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The claim that costs nothing to state and everything to get wrong: <b>partials do not exist on
 * the wire</b>.
 *
 * <p>If one ever leaked into a {@code UIIncrementDto}, every renderer would need to learn to
 * resolve it — Vaadin, Redwood, React Native, both IDE plugins — and a static bundle would carry a
 * reference it has no server to follow. Resolving server-side is what makes the feature arrive
 * everywhere at once; this test is what keeps that true.
 */
class PartialWireSyncTest {

  @SuppressWarnings("unused")
  @UI("/partial-host")
  public static class PartialHostForm {

    String name = "n";

    @Action
    Component showAddress() {
      return FormLayout.builder()
          .content(
              List.of(
                  FormField.builder().id("name").label("Name").build(),
                  new Partial("address-block")))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PartialHostForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ClientSideComponentDto form() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/partial-host")
                .actionId("showAddress")
                .serverSideType(PartialHostForm.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of("name", "n"))
                .build());
    return (ClientSideComponentDto) increment.fragments().get(0).component();
  }

  @Test
  void theFragmentIsAlreadyResolvedByTheTimeTheClientSeesIt() {
    assertThat(form().children()).hasSize(3);
  }

  @Test
  void whatArrivesAreTheFragmentsFieldsSplicedInPlace() {
    // Not a nested layout holding them: in a form grid that would be a visible, wrong render.
    assertThat(form().children())
        .allSatisfy(child -> assertThat(child).isInstanceOf(ClientSideComponentDto.class));
  }
}
