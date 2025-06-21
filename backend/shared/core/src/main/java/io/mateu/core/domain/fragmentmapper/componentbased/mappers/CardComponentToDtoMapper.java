package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.CardDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.Card;
import java.util.List;

public class CardComponentToDtoMapper {

  public static ComponentDto mapCardToDto(Card card) {
    return new ComponentDto(CardDto.builder().build(), "fieldId", null, List.of());
  }
}
