package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CustomFieldDto;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CustomFieldComponentToDtoMapper {

  public static ClientSideComponentDto mapCustomFieldToDto(
      CustomField customField,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new CustomFieldDto(
            customField.label(),
            mapComponentToDto(
                null,
                customField.content(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest),
            customField.colspan() > 0 ? customField.colspan() : 1),
        "fieldId",
        List.of(),
        customField.style(),
        customField.cssClasses(),
        null);
  }
}
