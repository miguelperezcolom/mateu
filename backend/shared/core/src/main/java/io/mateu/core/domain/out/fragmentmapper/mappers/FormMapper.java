package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormMapper {

  public static ComponentDto mapFormToDto(
      Form form,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var formMetadataDto =
        FormDto.builder()
            .title(form.title())
            .subtitle(form.subtitle())
            .noHeader(form.noHeader())
            .avatar(
                form.avatar() != null
                    ? mapComponentToDto(
                            null,
                            form.avatar(),
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest)
                        .addStyle("width: 4rem;height: 4rem;")
                    : null)
            .header(
                form.header() != null
                    ? form.header().stream()
                        .map(
                            component ->
                                mapComponentToDto(
                                    null,
                                    component,
                                    baseUrl,
                                    route,
                                    consumedRoute,
                                    initiatorComponentId,
                                    httpRequest))
                        .toList()
                    : null)
            .footer(
                form.footer() != null
                    ? form.footer().stream()
                        .map(
                            component ->
                                mapComponentToDto(
                                    null,
                                    component,
                                    baseUrl,
                                    route,
                                    consumedRoute,
                                    initiatorComponentId,
                                    httpRequest))
                        .toList()
                    : null)
            .toolbar(form.toolbar().stream().map(FormMapper::mapToButtonDto).toList())
            .buttons(form.buttons().stream().map(FormMapper::mapToButtonDto).toList())
            .build();
    return new ClientSideComponentDto(
        formMetadataDto,
        form.id(),
        form.content().stream()
            .map(
                component ->
                    mapComponentToDto(
                        null,
                        component,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest))
            .toList(),
        form.style(),
        form.cssClasses(),
        null);
  }

  static ButtonDto mapToButtonDto(UserTrigger userTrigger) {
    if (userTrigger == null) return null;
    if (userTrigger instanceof ButtonGroup group) {
      return ButtonDto.builder()
          .label(group.label())
          .iconOnLeft(group.iconOnLeft())
          .iconOnRight(group.iconOnRight())
          .separatorBefore(group.separatorBefore())
          .children(group.buttons().stream().map(FormMapper::mapToButtonDto).toList())
          .build();
    }
    if (userTrigger instanceof Button button) {
      return ButtonDto.builder()
          .actionId(button.getActionId())
          .label(button.label())
          .iconOnLeft(button.iconOnLeft())
          .iconOnRight(button.iconOnRight())
          .disabled(button.disabled())
          .shortcut(button.shortcut())
          .color(resolveColor(button))
          .buttonStyle(resolveStyle(button))
          .size(resolveSize(button))
          .separatorBefore(button.separatorBefore())
          .build();
    }
    return null;
  }

  static ButtonDto mapToButtonDto(Button button) {
    return mapToButtonDto((UserTrigger) button);
  }

  private static ButtonColorDto resolveColor(Button button) {
    if (button.color() != null
        && button.color() != ButtonColor.normal
        && button.color() != ButtonColor.none) {
      return ButtonColorDto.valueOf(button.color().name());
    }
    String id = button.getActionId();
    if (id != null
        && (id.equals("delete") || id.equals("delete-edit") || id.startsWith("delete-"))) {
      return ButtonColorDto.error;
    }
    return null;
  }

  private static ButtonSizeDto resolveSize(Button button) {
    if (button.size() != null && button.size() != ButtonSize.none) {
      return ButtonSizeDto.valueOf(button.size().name());
    }
    return null;
  }

  private static ButtonStyleDto resolveStyle(Button button) {
    if (button.buttonStyle() != null) {
      return ButtonStyleDto.valueOf(button.buttonStyle().name());
    }
    String id = button.getActionId();
    if (id == null) return null;
    if (id.equals("save") || id.equals("create")) {
      return ButtonStyleDto.primary;
    }
    if (id.startsWith("cancel") || id.equals("back") || id.equals("backToList")) {
      return ButtonStyleDto.tertiary;
    }
    return null;
  }
}
