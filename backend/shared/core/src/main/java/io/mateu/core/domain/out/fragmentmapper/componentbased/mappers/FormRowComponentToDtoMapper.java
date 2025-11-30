package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormRowDto;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormRowComponentToDtoMapper {

  public static ClientSideComponentDto mapFormRowToDto(
      FormRow formRow,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto = FormRowDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        formRow.id(),
        formRow.content().stream()
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
        formRow.style(),
        formRow.cssClasses(),
        null);
  }
}
