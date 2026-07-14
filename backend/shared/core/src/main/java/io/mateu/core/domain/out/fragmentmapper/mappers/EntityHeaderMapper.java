package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ChipDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.EntityHeaderDto;
import io.mateu.dtos.FactDto;
import io.mateu.uidl.data.EntityHeader;
import java.util.List;

public class EntityHeaderMapper {

  public static ClientSideComponentDto mapEntityHeaderToDto(EntityHeader entityHeader) {
    return new ClientSideComponentDto(
        EntityHeaderDto.builder()
            .title(entityHeader.title())
            .badges(
                entityHeader.badges() != null
                    ? entityHeader.badges().stream()
                        .map(badge -> new ChipDto(badge.label(), badge.color()))
                        .toList()
                    : List.of())
            .subtitle(entityHeader.subtitle())
            .facts(
                entityHeader.facts() != null
                    ? entityHeader.facts().stream()
                        .map(fact -> new FactDto(fact.label(), fact.value()))
                        .toList()
                    : List.of())
            .metricLabel(entityHeader.metricLabel())
            .metricValue(entityHeader.metricValue())
            .metricCaption(entityHeader.metricCaption())
            .build(),
        entityHeader.id(),
        List.of(),
        entityHeader.style(),
        entityHeader.cssClasses(),
        null);
  }
}
