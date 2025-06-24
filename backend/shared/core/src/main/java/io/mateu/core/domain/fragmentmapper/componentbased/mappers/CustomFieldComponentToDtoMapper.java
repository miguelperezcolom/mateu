package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CustomFieldDto;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CustomFieldComponentToDtoMapper {

  public static ComponentDto mapCustomFieldToDto(
      CustomField customField, String baseUrl, String route, HttpRequest httpRequest) {
    return new ComponentDto(
        new CustomFieldDto(
            customField.label(),
            mapComponentToDto(null, customField.content(), baseUrl, route, httpRequest)),
        "fieldId",
        null,
        List.of());
  }
}
