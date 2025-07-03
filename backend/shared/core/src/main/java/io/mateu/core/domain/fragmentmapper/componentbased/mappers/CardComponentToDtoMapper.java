package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.CardDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Card;
import java.util.List;

public class CardComponentToDtoMapper {

  public static ClientSideComponentDto mapCardToDto(Card card) {
    return new ClientSideComponentDto(CardDto.builder().build(), "fieldId", List.of(), "", "");
  }
}
