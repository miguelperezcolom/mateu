package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComparisonCardDto;
import io.mateu.uidl.data.ComparisonCard;
import java.util.List;

public class ComparisonCardMapper {

  public static ClientSideComponentDto mapComparisonCardToDto(ComparisonCard card) {
    return new ClientSideComponentDto(
        ComparisonCardDto.builder()
            .title(card.title())
            .leftLabel(card.leftLabel())
            .leftValue(card.leftValue())
            .rightLabel(card.rightLabel())
            .rightValue(card.rightValue())
            .delta(card.delta())
            .trend(card.trend())
            .build(),
        card.id(),
        List.of(),
        card.style(),
        card.cssClasses(),
        null);
  }
}
