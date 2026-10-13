package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ChipDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.EntityHeaderDto;
import io.mateu.dtos.FactDto;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import java.util.List;

public class EntityHeaderMapper {

  /** The icon of a fact's action button when the fact names none: a pencil (edit/change it). */
  public static final String DEFAULT_FACT_ACTION_ICON = "vaadin:pencil";

  /**
   * A fact on the wire: a display-only one is just its label and value (the action members stay
   * null and are omitted from the JSON); one with an {@code actionId} carries its button — the icon
   * defaulting to a pencil, the parameters only when there are any.
   */
  static FactDto mapFact(Fact fact) {
    var actionId = fact.actionId() != null && !fact.actionId().isBlank() ? fact.actionId() : null;
    if (actionId == null) {
      return new FactDto(fact.label(), fact.value());
    }
    return new FactDto(
        fact.label(),
        fact.value(),
        actionId,
        fact.icon() != null && !fact.icon().isBlank() ? fact.icon() : DEFAULT_FACT_ACTION_ICON,
        fact.actionLabel(),
        fact.parameters() != null && !fact.parameters().isEmpty() ? fact.parameters() : null);
  }

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
                    ? entityHeader.facts().stream().map(EntityHeaderMapper::mapFact).toList()
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
