package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.HorizontalAlignmentDto;
import io.mateu.dtos.JustificationDto;
import io.mateu.dtos.SpacingVariantDto;
import io.mateu.dtos.VerticalLayoutDto;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class VerticalLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapVerticalLayoutToDto(
      VerticalLayout verticalLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        VerticalLayoutDto.builder()
            .padding(verticalLayout.padding())
            .spacing(verticalLayout.spacing())
            .fullWidth(verticalLayout.fullWidth())
            .margin(verticalLayout.margin())
            .spacingVariant(
                verticalLayout.spacingVariant() != null
                    ? SpacingVariantDto.valueOf(verticalLayout.spacingVariant().name())
                    : null)
            .justification(
                verticalLayout.justification() != null
                    ? JustificationDto.valueOf(verticalLayout.justification().name())
                    : null)
            .flexGrows(verticalLayout.flexGrows())
            .horizontalAlignment(
                verticalLayout.horizontalAlignment() != null
                    ? HorizontalAlignmentDto.valueOf(verticalLayout.horizontalAlignment().name())
                    : null)
            .wrap(verticalLayout.wrap())
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        verticalLayout.id(),
        applyFlowGrows(
            verticalLayout.content().stream()
                .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
                .toList(),
            verticalLayout.flexGrows()),
        verticalLayout.style(),
        verticalLayout.cssClasses(),
        null);
  }

  private static List<ComponentDto> applyFlowGrows(
      List<ComponentDto> components, List<Integer> flexGrows) {
    if (flexGrows != null && !flexGrows.isEmpty()) {
      AtomicInteger index = new AtomicInteger();
      return components.stream()
          .map(
              component -> {
                var currentPos = index.getAndIncrement();
                return currentPos < flexGrows.size()
                    ? component.setStyle(addFlexGrows(component.style(), flexGrows.get(currentPos)))
                    : component;
              })
          .toList();
    }
    return components;
  }

  private static String addFlexGrows(String style, int flexGrows) {
    if (style == null) {
      style = "";
    }
    style += "flex-grow: " + flexGrows + ";";
    return style;
  }
}
