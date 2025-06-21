package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.uidl.data.Element;
import java.util.List;

public class ElementComponentToDtoMapper {

  public static ComponentDto mapElementToDto(Element element) {
    return new ComponentDto(
        new ElementDto(element.name(), element.attributes(), element.content()),
        "fieldId",
        null,
        List.of());
  }
}
