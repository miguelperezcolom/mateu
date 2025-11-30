package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.CardDto;
import io.mateu.dtos.CardVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class CardComponentToDtoMapper {

  public static ClientSideComponentDto mapCardToDto(
      Card card,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        CardDto.builder()
            .title(
                mapComponentToDto(
                    null,
                    card.title(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .subtitle(
                mapComponentToDto(
                    null,
                    card.subtitle(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .footer(
                mapComponentToDto(
                    null,
                    card.footer(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .content(
                mapComponentToDto(
                    null,
                    card.content(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .header(
                mapComponentToDto(
                    null,
                    card.header(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .media(
                mapComponentToDto(
                    null,
                    card.media(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .headerPrefix(
                mapComponentToDto(
                    null,
                    card.headerPrefix(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .headerSuffix(
                mapComponentToDto(
                    null,
                    card.headerSuffix(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest))
            .variants(
                card.variants() != null
                    ? card.variants().stream()
                        .map(variant -> CardVariantDto.valueOf(variant.name()))
                        .toList()
                    : null)
            .build(),
        "fieldId",
        List.of(),
        card.style(),
        card.cssClasses(),
        null);
  }
}
