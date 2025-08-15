package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DirectoryDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Directory;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DirectoryComponentToDtoMapper {

  public static ClientSideComponentDto mapDirectoryToDto(
      Directory directory, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new DirectoryDto(buildMenu(directory.menu(), baseUrl, route, httpRequest)),
        "fieldId",
        List.of(),
        directory.style(),
        directory.cssClasses(),
        null);
  }

  protected static List<MenuOptionDto> buildMenu(
      List<Actionable> menu, String baseUrl, String route, HttpRequest httpRequest) {
    return menu.stream()
        .map(
            option ->
                MenuOptionDto.builder()
                    .label(option.label())
                    .component(
                        option.component() != null
                            ? mapComponentToDto(
                                null, option.component(), baseUrl, route, httpRequest)
                            : null)
                    .destination(
                        option instanceof RouteLink || option instanceof ContentLink
                            ? new GoToRouteDto("", getPath(option), null)
                            : null)
                    .visible(true)
                    .selected(option.selected())
                    .disabled(option.disabled())
                    .disabledOnClick(option.disabledOnClick())
                    .className(option.className())
                    .itemData(option.itemData())
                    .submenus(
                        option instanceof Menu asMenu
                            ? buildMenu(asMenu.submenu(), baseUrl, route, httpRequest)
                            : List.of())
                    .separator(option instanceof MenuSeparator)
                    .build())
        .toList();
  }

  private static String getPath(Actionable option) {
    if (option.path() == null) {
      return camelcasize(option.label());
    }
    return option.path();
  }
}
