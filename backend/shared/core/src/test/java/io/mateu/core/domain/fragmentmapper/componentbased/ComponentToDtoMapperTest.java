package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.TextComponent;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ComponentToDtoMapperTest {

  @Test
  void mapsToElementDto() {
    var expected =
        UIFragmentDto.builder()
            .targetComponentId("initiator")
            .component(
                new ComponentDto(new ElementDto("div", Map.of(), "Hola"), "id", null, List.of()))
            .build();
    var dto =
        mapComponentToFragment(
            null,
            new TextComponent("Hola"),
            "base_url",
            "route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
    assertThat(dto).usingRecursiveComparison().isEqualTo(expected);
  }
}
