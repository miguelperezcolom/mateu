package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.uidl.data.TextComponent;
import java.util.List;
import java.util.Map;

public class TextComponentToDtoMapper {

  public static ComponentDto mapTextToDto(TextComponent textComponent) {
    return new ComponentDto(
        new ElementDto("div", Map.of(), textComponent.text()), "id", null, List.of());
  }
}
