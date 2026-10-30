package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BadgeDto;
import io.mateu.dtos.ButtonColorDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ButtonSizeDto;
import io.mateu.dtos.ButtonStyleDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FabDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.KPIDto;
import io.mateu.dtos.PeerNavDto;
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
            // the page-header elements a reflected page gets from its annotations, authored as
            // data: same wire fields as PageDto's, so every renderer's header reads them alike
            .overline(blankToNull(form.overline()))
            .titlePlaceholder(blankToNull(form.titlePlaceholder()))
            .timestamp(blankToNull(form.timestamp()))
            .badges(form.badges().stream().map(FormMapper::mapChipToBadgeDto).toList())
            .kpis(
                form.kpis().isEmpty()
                    ? null
                    : form.kpis().stream()
                        .map(fact -> new KPIDto(fact.label(), fact.value(), null, null))
                        .toList())
            .peerNav(
                form.peerNav() != null
                    ? new PeerNavDto(
                        form.peerNav().prevLabel(),
                        form.peerNav().prevRoute(),
                        form.peerNav().nextLabel(),
                        form.peerNav().nextRoute())
                    : null)
            .switcher(PageMapper.mapSwitcher(form.recordSwitcher()))
            .banners(form.banners().stream().map(PageMapper::mapToBannerDto).toList())
            .fabs(form.fabs().isEmpty() ? null : mapFabs(form.fabs()))
            .template(PageTemplates.dtoOf(form.template()))
            .build();
    return new ClientSideComponentDto(
        formMetadataDto,
        form.id(),
        PageTemplates.contentOf(form).stream()
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

  /** A header chip ({@code label}/{@code color}) as the header badge a reflected page sends. */
  static BadgeDto mapChipToBadgeDto(io.mateu.uidl.data.Chip chip) {
    return new BadgeDto(
        chip.label(),
        null,
        null,
        chip.color() != null && !chip.color().isBlank() ? chip.color() : "normal",
        false,
        false,
        false);
  }

  /** Data-authored page FABs, in their declared {@code order} (ties keep the list's order). */
  static java.util.List<FabDto> mapFabs(java.util.List<io.mateu.uidl.data.PageFab> fabs) {
    return fabs.stream()
        .sorted(java.util.Comparator.comparingInt(io.mateu.uidl.data.PageFab::order))
        .map(
            fab ->
                FabDto.builder()
                    .id(fab.actionId())
                    .label(fab.label())
                    .icon(fab.icon())
                    .actionId(fab.actionId())
                    .buttonStyle(
                        fab.buttonStyle() != null && !fab.buttonStyle().isBlank()
                            ? fab.buttonStyle()
                            : "primary")
                    .build())
        .toList();
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value;
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
          .actionId(button.resolvedActionId())
          .label(button.label())
          .iconOnLeft(button.iconOnLeft())
          .iconOnRight(button.iconOnRight())
          .disabled(button.disabled())
          .shortcut(button.shortcut())
          .color(resolveColor(button))
          .buttonStyle(resolveStyle(button))
          .size(resolveSize(button))
          .separatorBefore(button.separatorBefore())
          .route(routeOf(button))
          .rowsSelectedRequired(button.rowsSelectedRequired())
          .build();
    }
    return null;
  }

  /**
   * A button whose {@code actionable} is a {@code RouteLink} NAVIGATES on the client — the button
   * form of a menu link (a listing's "New", a record's "Back to the list") — instead of running a
   * server action. The route travels on the wire with its {@code ${state.x}} template intact.
   */
  private static String routeOf(Button button) {
    return button.actionable() instanceof io.mateu.uidl.data.RouteLink routeLink
        ? routeLink.route()
        : null;
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
    String id = button.resolvedActionId();
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
    String id = button.resolvedActionId();
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
