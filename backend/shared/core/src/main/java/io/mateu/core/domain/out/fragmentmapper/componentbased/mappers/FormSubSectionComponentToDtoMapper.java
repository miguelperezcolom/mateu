package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormSubSectionDto;
import io.mateu.uidl.data.FormSubSection;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormSubSectionComponentToDtoMapper {

  public static ClientSideComponentDto mapFormSubSectionToDto(
      FormSubSection formSection,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new FormSubSectionDto(formSection.title()),
        "fieldId",
        formSection.content().stream()
            .map(
                content ->
                    mapComponentToDto(
                        null,
                        content,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest))
            .toList(),
        formSection.style(),
        formSection.cssClasses(),
        null);
  }
}
