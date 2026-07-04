package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.HeroSectionDto;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class HeroSectionMapper {

  public static ClientSideComponentDto mapHeroSectionToDto(
      HeroSection heroSection,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        HeroSectionDto.builder()
            .title(heroSection.title())
            .subtitle(heroSection.subtitle())
            .image(heroSection.image())
            .height(heroSection.height())
            .centered(heroSection.centered())
            .build(),
        heroSection.id(),
        heroSection.content() != null
            ? heroSection.content().stream()
                .map(
                    item ->
                        mapComponentToDto(
                            null,
                            item,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest))
                .toList()
            : List.of(),
        heroSection.style(),
        heroSection.cssClasses(),
        null);
  }
}
