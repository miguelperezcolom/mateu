package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DirectoryDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.Directory;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DirectoryMapper {

  public static ClientSideComponentDto mapDirectoryToDto(
      Directory directory,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new DirectoryDto(
            buildMenu(
                directory.menu(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        "fieldId",
        List.of(),
        directory.style(),
        directory.cssClasses(),
        null);
  }

  protected static List<MenuOptionDto> buildMenu(
      List<Actionable> menu,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    // one rule for every menu a page carries in its content
    return ContextMenuMapper.buildMenu(
        menu, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }
}
