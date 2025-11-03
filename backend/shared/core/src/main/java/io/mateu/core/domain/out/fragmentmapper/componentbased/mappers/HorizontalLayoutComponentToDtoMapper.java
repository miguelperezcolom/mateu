package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.HorizontalLayoutDto;
import io.mateu.dtos.JustificationDto;
import io.mateu.dtos.SpacingVariantDto;
import io.mateu.dtos.VerticalAlignmentDto;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class HorizontalLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapHorizontalLayoutToDto(
      HorizontalLayout horizontalLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        HorizontalLayoutDto.builder()
            .padding(horizontalLayout.padding())
            .spacing(horizontalLayout.spacing())
            .fullWidth(horizontalLayout.fullWidth())
            .margin(horizontalLayout.margin())
            .spacingVariant(
                horizontalLayout.spacingVariant() != null
                    ? SpacingVariantDto.valueOf(horizontalLayout.spacingVariant().name())
                    : null)
            .justification(
                horizontalLayout.justification() != null
                    ? JustificationDto.valueOf(horizontalLayout.justification().name())
                    : null)
            .flexGrows(horizontalLayout.flexGrows())
            .verticalAlignment(
                horizontalLayout.verticalAlignment() != null
                    ? VerticalAlignmentDto.valueOf(horizontalLayout.verticalAlignment().name())
                    : null)
            .wrap(horizontalLayout.wrap())
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        horizontalLayout.id(),
        applyFlowGrows(
            horizontalLayout.content().stream()
                .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
                .toList(),
            horizontalLayout.flexGrows()),
        horizontalLayout.style(),
        horizontalLayout.cssClasses(),
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
