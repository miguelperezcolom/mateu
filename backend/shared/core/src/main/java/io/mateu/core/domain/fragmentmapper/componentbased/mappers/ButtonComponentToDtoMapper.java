package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Button;
import java.util.List;

public class ButtonComponentToDtoMapper {

  public static ClientSideComponentDto mapButtonToDto(Button button) {
    return new ClientSideComponentDto(
        new ButtonDto(
            button.id(),
            button.actionId(),
            button.iconOnLeft(),
            button.iconOnRight(),
            button.label()),
        "fieldId",
        List.of(),
        "",
        "");
  }
}
