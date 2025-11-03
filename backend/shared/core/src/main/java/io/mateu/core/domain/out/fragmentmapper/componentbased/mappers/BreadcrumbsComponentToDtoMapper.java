package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.BreadcrumbDto;
import io.mateu.dtos.BreadcrumbsDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Breadcrumbs;
import java.util.List;

public class BreadcrumbsComponentToDtoMapper {

  public static ClientSideComponentDto mapBreadcrumbsToDto(Breadcrumbs breadcrumbs) {
    return new ClientSideComponentDto(
        new BreadcrumbsDto(
            breadcrumbs.currentItemText(),
            breadcrumbs.breadcrumbs().stream()
                .map(breadcrumb -> new BreadcrumbDto(breadcrumb.text(), breadcrumb.link()))
                .toList()),
        "fieldId",
        List.of(),
        breadcrumbs.style(),
        breadcrumbs.cssClasses(),
        null);
  }
}
