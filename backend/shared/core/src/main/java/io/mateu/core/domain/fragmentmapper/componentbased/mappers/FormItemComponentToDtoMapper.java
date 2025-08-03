package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormItemDto;
import io.mateu.uidl.data.FormItem;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormItemComponentToDtoMapper {

  public static ClientSideComponentDto mapFormItemToDto(
      FormItem formItem, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = FormItemDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        formItem.id(),
        formItem.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList(),
        formItem.style(),
        formItem.cssClasses());
  }
}
