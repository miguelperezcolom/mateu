package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.Button;
import java.util.List;

public class ButtonComponentToDtoMapper {

  public static ComponentDto mapButtonToDto(Button button) {
    return new ComponentDto(
        new ButtonDto(
            button.id(),
            button.actionId(),
            button.iconOnLeft(),
            button.iconOnRight(),
            button.label()),
        "fieldId",
        null,
        List.of());
  }
}
