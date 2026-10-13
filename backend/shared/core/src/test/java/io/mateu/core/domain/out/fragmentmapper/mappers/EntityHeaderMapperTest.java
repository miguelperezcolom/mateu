package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.EntityHeaderDto;
import io.mateu.dtos.FactDto;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * An EntityHeader fact is display-only unless it names an action: then it carries the icon-only
 * button the renderers draw after its value (icon defaulting to a pencil). A display-only fact's
 * JSON is exactly what it was before facts could act — {@code {"label","value"}}.
 */
class EntityHeaderMapperTest {

  private static List<FactDto> facts(Fact... facts) {
    var dto =
        (EntityHeaderDto)
            EntityHeaderMapper.mapEntityHeaderToDto(
                    EntityHeader.builder().title("Stay").facts(List.of(facts)).build())
                .metadata();
    return dto.facts();
  }

  @Test
  void aFactWithoutActionIsJustItsLabelAndValue() throws Exception {
    var fact = facts(new Fact("TOTAL RESERVA", "€ 4.890,00")).get(0);

    assertThat(fact).isEqualTo(new FactDto("TOTAL RESERVA", "€ 4.890,00"));
    assertThat(WireMapper.shared().writeValueAsString(fact))
        .isEqualTo("{\"label\":\"TOTAL RESERVA\",\"value\":\"€ 4.890,00\"}");
  }

  @Test
  void anIconOrParametersWithoutAnActionIdAreNotAButton() {
    var fact =
        facts(
                Fact.builder()
                    .label("AGENCIA")
                    .value("TUI")
                    .icon("vaadin:cog")
                    .actionId(" ")
                    .parameters(Map.of("x", 1))
                    .build())
            .get(0);

    assertThat(fact).isEqualTo(new FactDto("AGENCIA", "TUI"));
  }

  @Test
  void aFactWithAnActionCarriesItsButton() throws Exception {
    var fact =
        facts(
                Fact.builder()
                    .label("EMPRESA")
                    .value("Acme Corporation Ltd")
                    .actionId("changeCompany")
                    .icon("vaadin:edit")
                    .actionLabel("Cambiar empresa")
                    .parameters(Map.of("stayId", "S-1"))
                    .build())
            .get(0);

    assertThat(fact.actionId()).isEqualTo("changeCompany");
    assertThat(fact.icon()).isEqualTo("vaadin:edit");
    assertThat(fact.actionLabel()).isEqualTo("Cambiar empresa");
    assertThat(fact.parameters()).containsExactlyEntriesOf(Map.of("stayId", "S-1"));
    assertThat(WireMapper.shared().writeValueAsString(fact))
        .isEqualTo(
            "{\"label\":\"EMPRESA\",\"value\":\"Acme Corporation Ltd\",\"actionId\":\"changeCompany\","
                + "\"icon\":\"vaadin:edit\",\"actionLabel\":\"Cambiar empresa\","
                + "\"parameters\":{\"stayId\":\"S-1\"}}");
  }

  @Test
  void theIconDefaultsToAPencilAndNoParametersAreOmitted() throws Exception {
    var fact =
        facts(Fact.builder().label("EMPRESA").value("Acme").actionId("changeCompany").build())
            .get(0);

    assertThat(fact.icon()).isEqualTo(EntityHeaderMapper.DEFAULT_FACT_ACTION_ICON);
    assertThat(fact.actionLabel()).isNull();
    assertThat(fact.parameters()).isNull();
    assertThat(WireMapper.shared().writeValueAsString(fact))
        .isEqualTo(
            "{\"label\":\"EMPRESA\",\"value\":\"Acme\",\"actionId\":\"changeCompany\","
                + "\"icon\":\"vaadin:pencil\"}");
  }

  @Test
  void theTwoArgumentConstructorAndTheBuilderStillMakeADisplayOnlyFact() {
    assertThat(new Fact("A", "B")).isEqualTo(Fact.builder().label("A").value("B").build());
    assertThat(new Fact("A", "B").actionId()).isNull();
  }
}
