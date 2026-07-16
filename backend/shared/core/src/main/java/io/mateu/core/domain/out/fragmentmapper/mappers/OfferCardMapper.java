package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.OfferCardDto;
import io.mateu.uidl.data.OfferCard;
import java.util.List;

public class OfferCardMapper {

  public static ClientSideComponentDto mapOfferCardToDto(OfferCard offerCard) {
    return new ClientSideComponentDto(
        OfferCardDto.builder()
            .tag(offerCard.tag())
            .title(offerCard.title())
            .subtitle(offerCard.subtitle())
            .image(offerCard.image())
            .features(offerCard.features() != null ? offerCard.features() : List.of())
            .priceLabel(offerCard.priceLabel())
            .actionLabel(offerCard.actionLabel())
            .actionId(offerCard.actionId())
            .current(offerCard.current())
            .currentLabel(offerCard.currentLabel())
            .added(offerCard.added())
            .addedLabel(offerCard.addedLabel())
            .build(),
        offerCard.id(),
        List.of(),
        offerCard.style(),
        offerCard.cssClasses(),
        null);
  }
}
