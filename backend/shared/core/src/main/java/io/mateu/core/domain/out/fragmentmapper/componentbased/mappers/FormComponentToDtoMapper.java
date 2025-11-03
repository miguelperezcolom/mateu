package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormComponentToDtoMapper {

  public static ComponentDto mapFormToDto(
      Form form,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var formMetadataDto =
        FormDto.builder()
            .title(form.title())
            .subtitle(form.subtitle())
            .noHeader(form.noHeader())
            .avatar(
                form.avatar() != null
                    ? mapComponentToDto(null, form.avatar(), baseUrl, route, httpRequest)
                        .addStyle("width: 4rem;height: 4rem;")
                    : null)
            .header(
                form.header() != null
                    ? form.header().stream()
                        .map(
                            component ->
                                mapComponentToDto(null, component, baseUrl, route, httpRequest))
                        .toList()
                    : null)
            .footer(
                form.footer() != null
                    ? form.footer().stream()
                        .map(
                            component ->
                                mapComponentToDto(null, component, baseUrl, route, httpRequest))
                        .toList()
                    : null)
            .toolbar(form.toolbar().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList())
            .buttons(form.buttons().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList())
            .build();
    return new ClientSideComponentDto(
        formMetadataDto,
        form.id(),
        form.content().stream()
            .map(component -> mapComponentToDto(null, component, baseUrl, route, httpRequest))
            .toList(),
        form.style(),
        form.cssClasses(),
        null);
  }

  static ButtonDto mapToButtonDto(UserTrigger userTrigger) {
    if (userTrigger == null) return null;
    if (userTrigger instanceof Button button) {
      return ButtonDto.builder()
          .actionId(button.getActionId())
          .label(button.label())
          .iconOnLeft(button.iconOnLeft())
          .iconOnRight(button.iconOnRight())
          .disabled(button.disabled())
          .build();
    }
    return null;
  }
}
