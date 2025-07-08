package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.data.Text;
import java.util.List;
import java.util.Map;

public class TextComponentToDtoMapper {

  public static ClientSideComponentDto mapTextToDto(Text text) {
    return new ClientSideComponentDto(
        new TextDto(TextContainerDto.valueOf(text.container().name()), Map.of(), text.text()),
        "fieldId",
        List.of(),
        text.style(),
        text.cssClasses());
  }
}
