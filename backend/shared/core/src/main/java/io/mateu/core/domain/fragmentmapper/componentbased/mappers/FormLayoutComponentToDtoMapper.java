package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapFormLayoutToDto(
      FormLayout formLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        FormLayoutDto.builder()
            .maxColumns(formLayout.maxColumns())
            .autoResponsive(formLayout.autoResponsive())
            .columnSpacing(formLayout.columnSpacing())
            .itemLabelSpacing(formLayout.itemLabelSpacing())
            .itemRowSpacing(formLayout.itemRowSpacing())
            .columnWidth(formLayout.columnWidth())
            .expandColumns(formLayout.expandColumns())
            .expandFields(formLayout.expandFields())
            .itemLabelWidth(formLayout.itemLabelWidth())
            .labelsAside(formLayout.labelsAside())
            .responsiveSteps(formLayout.responsiveSteps())
            .maxColumns(formLayout.maxColumns() > 0 ? formLayout.maxColumns() : 100)
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        formLayout.id(),
        formLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList(),
        formLayout.style(),
        formLayout.cssClasses(),
        null);
  }
}
