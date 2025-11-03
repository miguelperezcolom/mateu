package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.uidl.data.Element;
import java.util.List;

public class ElementComponentToDtoMapper {

  public static ClientSideComponentDto mapElementToDto(Element element) {
    return new ClientSideComponentDto(
        new ElementDto(element.name(), element.attributes(), element.on(), element.content()),
        "fieldId",
        List.of(),
        element.style(),
        element.cssClasses(),
        null);
  }
}
