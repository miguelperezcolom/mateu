package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Element;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Every Element used to travel with the placeholder id "fieldId", so renderers keying each
 * element's container by id put two of them (a floor plan per tab) into the same box.
 */
class ElementMapperTest {

  private static Element plan(String rooms) {
    return new Element(
        "pms-floor-plan", Map.of("rooms", rooms), Map.of("room-selected", "pick"), "", "", "");
  }

  @Test
  void twoDifferentElementsGetDifferentIdsAndTheSameDefinitionKeepsItsId() {
    var floor1 = ElementMapper.mapElementToDto(plan("[1]")).id();
    var floor2 = ElementMapper.mapElementToDto(plan("[2]")).id();
    assertThat(floor1).isNotEqualTo(floor2).isNotEqualTo("fieldId").startsWith("element-");
    // a re-render of the same screen keeps the id: the element (and its own state) is reused
    assertThat(ElementMapper.mapElementToDto(plan("[1]")).id()).isEqualTo(floor1);
  }

  @Test
  void anExplicitIdAttributeWins() {
    var element = new Element("x-graph", Map.of("id", "graph"), "");
    assertThat(ElementMapper.mapElementToDto(element).id()).isEqualTo("graph");
  }
}
