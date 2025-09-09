package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;

import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.ButtonVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Button;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ButtonComponentToDtoMapper {

  public static ClientSideComponentDto mapButtonToDto(Button button) {
    return new ClientSideComponentDto(
        ButtonDto.builder()
            .buttonStyle(
                button.buttonStyle() != null
                    ? ButtonStyleDto.valueOf(button.buttonStyle().name())
                    : null)
            .color(button.color() != null ? ButtonColorDto.valueOf(button.color().name()) : null)
            .label(button.label())
            .actionId(button.getActionId())
            .size(button.size() != null ? ButtonSizeDto.valueOf(button.size().name()) : null)
            .variant(
                button.variant() != null ? ButtonVariantDto.valueOf(button.variant().name()) : null)
            .image(button.image())
            .autofocus(button.autofocus())
            .iconOnLeft(button.iconOnLeft())
            .iconOnRight(button.iconOnRight())
            .disabled(button.disabled())
            .parameters(mapParameters(button.parameters()))
            .build(),
        button.id() != null ? button.id() : UUID.randomUUID().toString(),
        List.of(),
        button.style(),
        button.cssClasses(),
        null);
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
