package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;

import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.ButtonVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ButtonMapper {

  public static ClientSideComponentDto mapButtonToDto(Button button) {
    return new ClientSideComponentDto(
        ButtonDto.builder()
            .buttonStyle(
                button.buttonStyle() != null
                    ? ButtonStyleDto.valueOf(button.buttonStyle().name())
                    : null)
            .color(button.color() != null ? ButtonColorDto.valueOf(button.color().name()) : null)
            .label(button.label())
            .actionId(io.mateu.core.domain.act.FluentHandlerButtons.actionIdOf(button))
            .size(button.size() != null ? ButtonSizeDto.valueOf(button.size().name()) : null)
            .variant(
                button.variant() != null ? ButtonVariantDto.valueOf(button.variant().name()) : null)
            .image(button.image())
            .autofocus(button.autofocus())
            .iconOnLeft(button.iconOnLeft())
            .iconOnRight(button.iconOnRight())
            .disabled(button.disabled())
            .shortcut(button.shortcut())
            .parameters(mapParameters(button.parameters()))
            .separatorBefore(button.separatorBefore())
            .route(routeOf(button))
            .rowsSelectedRequired(button.rowsSelectedRequired())
            .build(),
        button.id() != null ? button.id() : UUID.randomUUID().toString(),
        List.of(),
        button.style(),
        button.cssClasses(),
        null);
  }

  /**
   * A {@link ButtonGroup} placed in CONTENT (not a toolbar): the same wire shape a toolbar group
   * has — a {@code Button} whose {@code children} are the group's buttons — wrapped like any
   * content button. Before, the dispatcher had no branch for it and the group was dropped silently.
   */
  public static ClientSideComponentDto mapButtonGroupToDto(ButtonGroup group) {
    var buttons = group.buttons() != null ? group.buttons() : List.<Button>of();
    return new ClientSideComponentDto(
        ButtonDto.builder()
            .label(group.label())
            .iconOnLeft(group.iconOnLeft())
            .iconOnRight(group.iconOnRight())
            .separatorBefore(group.separatorBefore())
            .children(buttons.stream().map(b -> (ButtonDto) mapButtonToDto(b).metadata()).toList())
            .build(),
        group.id() != null ? group.id() : UUID.randomUUID().toString(),
        List.of(),
        null,
        null,
        null);
  }

  /**
   * A button whose {@code actionable} is a {@code RouteLink} NAVIGATES on the client — the button
   * form of a menu link — instead of running a server action. The route travels on the wire (with
   * its {@code ${state.x}} template intact, interpolated in the browser), so the same "New"/"Edit"/
   * "Back" button works on a pure-DSL page with no view model behind it.
   */
  private static String routeOf(Button button) {
    return button.actionable() instanceof io.mateu.uidl.data.RouteLink routeLink
        ? routeLink.route()
        : null;
  }

  private static Object mapParameters(Object parameters) {
    if (parameters == null) {
      return null;
    }
    if (isBasic(parameters)) {
      return Map.of("value", parameters);
    }
    return parameters;
  }
}
