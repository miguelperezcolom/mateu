package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.uidl.data.Element;
import java.util.List;

public class ElementMapper {

  /**
   * The element's id on the wire: its own {@code id} attribute, else a stable hash of its
   * definition. Renderers key each element's container by it — with the old shared placeholder
   * ("fieldId") two Elements on one page (one floor plan per tab) hydrated into the same box. A
   * definition is the same across re-renders of the same screen (its {@code ${state.x}} templates
   * travel unresolved), so the element and the state it keeps (zoom, selection) survive them.
   */
  static String idOf(Element element) {
    var attributes = element.attributes();
    if (attributes != null && attributes.get("id") != null && !attributes.get("id").isBlank()) {
      return attributes.get("id");
    }
    return "element-"
        + Integer.toHexString(
            java.util.Objects.hash(
                element.name(),
                attributes == null ? null : new java.util.TreeMap<>(attributes),
                element.on() == null ? null : new java.util.TreeMap<>(element.on()),
                element.content()));
  }

  public static ClientSideComponentDto mapElementToDto(Element element) {
    return new ClientSideComponentDto(
        new ElementDto(
            element.name(), element.attributes(), element.on(), element.content(), element.html()),
        idOf(element),
        List.of(),
        element.style(),
        element.cssClasses(),
        null);
  }
}
