package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.ButtonVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Button;
import java.util.List;

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
            .actionId(button.actionId())
            .size(button.size() != null ? ButtonSizeDto.valueOf(button.size().name()) : null)
            .variant(
                button.variant() != null ? ButtonVariantDto.valueOf(button.variant().name()) : null)
            .image(button.image())
            .autofocus(button.autofocus())
            .iconOnLeft(button.iconOnLeft())
            .iconOnRight(button.iconOnRight())
            .disabled(button.disabled())
            .build(),
        "fieldId",
        List.of(),
        button.style(),
        button.cssClasses(),
        null);
  }
}
