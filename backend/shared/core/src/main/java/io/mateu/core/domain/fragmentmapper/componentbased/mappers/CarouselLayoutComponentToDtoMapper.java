package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.CarouselLayoutDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.OrientationDto;
import io.mateu.uidl.data.CarouselLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class CarouselLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapCarouselLayoutToDto(
      CarouselLayout carouselLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        CarouselLayoutDto.builder()
            .alt(carouselLayout.alt())
            .direction(
                carouselLayout.direction() != null
                    ? OrientationDto.valueOf(carouselLayout.direction().name())
                    : null)
            .animating(carouselLayout.animating())
            .auto(carouselLayout.auto())
            .end(carouselLayout.end())
            .nav(carouselLayout.nav())
            .disabled(carouselLayout.disabled())
            .disableKeys(carouselLayout.disableKeys())
            .disableSwipe(carouselLayout.disableSwipe())
            .dots(carouselLayout.dots())
            .duration(carouselLayout.duration())
            .loop(carouselLayout.loop())
            .selected(carouselLayout.selected())
            .total(carouselLayout.total())
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        carouselLayout.id(),
        carouselLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList(),
        carouselLayout.style(),
        carouselLayout.cssClasses());
  }
}
