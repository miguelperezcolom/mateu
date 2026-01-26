package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormComponentToDtoMapper.mapFormToDto;

import io.mateu.dtos.*;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class FieldComponentToDtoMapper {

  public static ClientSideComponentDto mapFormFieldToDto(
      FormField formField,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        FormFieldDto.builder()
            .fieldId(formField.id())
            .label(formField.label())
            .dataType(formField.dataType() != null ? formField.dataType().toString() : null)
            .stereotype(formField.stereotype() != null ? formField.stereotype().toString() : null)
            .placeholder(formField.placeholder())
            .description(formField.description())
            .cssClasses(formField.cssClasses())
            .colspan(formField.colspan() > 0 ? formField.colspan() : 1)
            .options(
                formField.options().stream()
                    .map(
                        option ->
                            new OptionDto(
                                option.value(),
                                option.label(),
                                option.description(),
                                option.image(),
                                option.imageStyle()))
                    .toList())
            .remoteCoordinates(mapRemoteCoordinates(formField.remoteCoordinates()))
            .initialValue(formField.initialValue())
            .readOnly(formField.readOnly())
            .required(formField.required())
            .autofocus(formField.autofocus())
            .formPosition(
                formField.formPosition() != null
                    ? FormPositionDto.valueOf(formField.formPosition().name())
                    : null)
            .sliderMin(formField.sliderMin())
            .sliderMax(formField.sliderMax())
            .stepButtonsVisible(formField.stepButtonsVisible())
            .step(formField.step())
            .style(formField.style())
            .itemIdPath(formField.itemIdPath())
            .columns(
                formField.columns().stream()
                    .map(
                        column ->
                            mapComponentToDto(
                                null,
                                column,
                                baseUrl,
                                route,
                                consumedRoute,
                                initiatorComponentId,
                                httpRequest))
                    .toList())
            .createForm(
                formField.createForm() != null
                    ? mapFormToDto(
                        formField.createForm(),
                        null,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest)
                    : null)
            .editor(
                formField.editor() != null
                    ? mapFormToDto(
                        formField.editor(),
                        null,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest)
                    : null)
            .onItemSelectionActionId(formField.onItemSelectionActionId())
            .attributes(mapAttributes(formField))
            .build(),
        formField.id(),
        List.of(),
        formField.style(),
        formField.cssClasses(),
        null);
  }

  private static List<PairDto> mapAttributes(FormField formField) {
    if (formField.attributes() != null) {
      return formField.attributes().entrySet().stream()
          .map(e -> new PairDto(e.getKey(), e.getValue()))
          .toList();
    }
    return null;
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
