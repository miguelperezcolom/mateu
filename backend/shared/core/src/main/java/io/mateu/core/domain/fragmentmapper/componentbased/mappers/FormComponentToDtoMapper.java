package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ActionTypeDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.TriggerDto;
import io.mateu.uidl.fluent.Button;
import io.mateu.uidl.fluent.ComponentSupplier;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class FormComponentToDtoMapper {

  public static ComponentDto mapFormToDto(
      Form form,
      ComponentSupplier componentSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var formMetadataDto =
        FormDto.builder()
            .title(form.title())
            .subtitle(form.subtitle())
            .actions(
                form.actions().stream()
                    .map(action -> ActionDto.builder().id(action.id()).href(action.href()).build())
                    .toList())
            .triggers(
                form.triggers().stream().map(FormComponentToDtoMapper::mapToTriggerDto).toList())
            .toolbar(form.toolbar().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList())
            .buttons(form.buttons().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList())
            .content(
                form.content().stream()
                    .map(
                        component ->
                            mapComponentToDto(null, component, baseUrl, route, httpRequest))
                    .toList())
            .build();
    return new ComponentDto(
        formMetadataDto, form.id(), componentSupplier.getClass().getName(), List.of());
  }

  static ButtonDto mapToButtonDto(UserTrigger userTrigger) {
    if (userTrigger == null) return null;
    if (userTrigger instanceof Button button) {
      return ButtonDto.builder()
          .id(button.id())
          .actionId(button.actionId())
          .label(button.label())
          .type(ActionTypeDto.Primary)
          .visible(true)
          .build();
    }
    return null;
  }

  static TriggerDto mapToTriggerDto(Trigger trigger) {
    if (trigger == null) return null;
    if (trigger instanceof OnLoadTrigger onLoadTrigger) {
      return new OnLoadTriggerDto(
          onLoadTrigger.actionId(), onLoadTrigger.timeoutMillis(), onLoadTrigger.times());
    }
    return null;
  }
}
