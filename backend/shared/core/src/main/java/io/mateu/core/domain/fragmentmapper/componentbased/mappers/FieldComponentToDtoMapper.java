package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormComponentToDtoMapper.mapFormToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.dtos.RemoteCoordinatesDto;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class FieldComponentToDtoMapper {

  public static ClientSideComponentDto mapFormFieldToDto(
      FormField formField, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        FormFieldDto.builder()
            .fieldId(formField.id())
            .label(formField.label())
            .dataType(formField.dataType() != null ? formField.dataType().toString() : null)
            .stereotype(formField.stereotype() != null ? formField.stereotype().toString() : null)
            .placeholder(formField.placeholder())
            .description(formField.description())
            .cssClasses(formField.cssClasses())
            .options(
                formField.options().stream()
                    .map(
                        option ->
                            new OptionDto(option.value(), option.label(), option.description()))
                    .toList())
            .remoteCoordinates(mapRemoteCoordinates(formField.remoteCoordinates()))
            .initialValue(formField.initialValue())
            .required(formField.required())
            .autofocus(formField.autofocus())
            .style(formField.style())
            .columns(
                formField.columns().stream()
                    .map(column -> mapComponentToDto(null, column, baseUrl, route, httpRequest))
                    .toList())
            .createForm(
                formField.createForm() != null
                    ? mapFormToDto(formField.createForm(), null, baseUrl, route, httpRequest)
                    : null)
            .editor(
                formField.editor() != null
                    ? mapFormToDto(formField.editor(), null, baseUrl, route, httpRequest)
                    : null)
            .build(),
        formField.id(),
        List.of(),
        formField.style(),
        formField.cssClasses(),
        null);
  }

  private static RemoteCoordinatesDto mapRemoteCoordinates(RemoteCoordinates remoteCoordinates) {
    if (remoteCoordinates == null) {
      return null;
    }
    return new RemoteCoordinatesDto(
        remoteCoordinates.baseUrl(),
        remoteCoordinates.route(),
        remoteCoordinates.consumedRoute(),
        remoteCoordinates.action(),
        remoteCoordinates.params());
  }
}
