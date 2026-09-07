package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.ButtonDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.RouteLink;
import org.junit.jupiter.api.Test;

/**
 * A button whose {@code actionable} is a {@code RouteLink} NAVIGATES on the client instead of
 * running a server action — the button form of a menu link (a listing's "New", a record's
 * "Edit"/"Back"). The route travels on {@code ButtonDto.route}, template intact, so a pure-DSL page
 * with no view model can move between its list/view/edit screens. Both button-mapping paths must
 * carry it: {@link FormMapper} (listing toolbars + form buttons) and {@link ButtonMapper} (a
 * standalone Button component).
 */
class ButtonRouteMappingTest {

  @Test
  void aRouteLinkActionableBecomesTheButtonsRoute() {
    var button =
        Button.builder()
            .label("Edit")
            .actionable(RouteLink.builder().route("people/${state.id}/edit").build())
            .build();

    assertThat(FormMapper.mapToButtonDto(button).route()).isEqualTo("people/${state.id}/edit");

    var component = ButtonMapper.mapButtonToDto(button);
    assertThat(((ButtonDto) component.metadata()).route()).isEqualTo("people/${state.id}/edit");
  }

  @Test
  void aPlainActionButtonHasNoRoute() {
    var button = Button.builder().label("Save").actionId("save").build();

    assertThat(FormMapper.mapToButtonDto(button).route()).isNull();
    assertThat(((ButtonDto) ButtonMapper.mapButtonToDto(button).metadata()).route()).isNull();
  }
}
