package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.data.Text;
import java.util.List;
import java.util.Map;

public class TextComponentToDtoMapper {

  public static ComponentDto mapTextToDto(Text text) {
    return new ComponentDto(
        new TextDto(TextContainerDto.valueOf(text.container().name()), Map.of(), text.text()),
        "fieldId",
        null,
        List.of());
  }
}
