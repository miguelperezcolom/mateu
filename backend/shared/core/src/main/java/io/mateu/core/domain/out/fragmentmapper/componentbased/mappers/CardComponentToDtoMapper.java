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
      Card card, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        CardDto.builder()
            .title(mapComponentToDto(null, card.title(), baseUrl, route, httpRequest))
            .subtitle(mapComponentToDto(null, card.subtitle(), baseUrl, route, httpRequest))
            .footer(mapComponentToDto(null, card.footer(), baseUrl, route, httpRequest))
            .content(mapComponentToDto(null, card.content(), baseUrl, route, httpRequest))
            .header(mapComponentToDto(null, card.header(), baseUrl, route, httpRequest))
            .media(mapComponentToDto(null, card.media(), baseUrl, route, httpRequest))
            .headerPrefix(mapComponentToDto(null, card.headerPrefix(), baseUrl, route, httpRequest))
            .headerSuffix(mapComponentToDto(null, card.headerSuffix(), baseUrl, route, httpRequest))
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
