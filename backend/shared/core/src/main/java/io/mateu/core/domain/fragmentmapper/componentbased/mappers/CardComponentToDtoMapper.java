package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.CardContentDto;
import io.mateu.dtos.CardDto;
import io.mateu.dtos.CardImageDto;
import io.mateu.dtos.CardVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardContent;
import io.mateu.uidl.data.CardImage;
import java.util.List;

public class CardComponentToDtoMapper {

  public static ClientSideComponentDto mapCardToDto(Card card) {
    return new ClientSideComponentDto(
        CardDto.builder()
            .title(card.title())
            .subtitle(card.subtitle())
            .footer(card.footer())
            .content(mapContent(card.content()))
            .header(card.header())
            .image(mapImage(card.image()))
            .headerPrefix(card.headerPrefix())
            .headerSuffix(card.headerSuffix())
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
        card.cssClasses());
  }

  private static CardImageDto mapImage(CardImage image) {
    return null;
  }

  private static CardContentDto mapContent(CardContent content) {
    return null;
  }
}
