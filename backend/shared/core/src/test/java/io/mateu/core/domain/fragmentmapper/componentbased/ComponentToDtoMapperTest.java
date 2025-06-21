package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Text;
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
                new ComponentDto(
                    new TextDto(TextContainerDto.p, Map.of(), "Hola"), "fieldId", null, List.of()))
            .build();
    var dto =
        mapComponentToFragment(
            null, new Text("Hola"), "base_url", "route", "initiator", new FakeHttpRequest());
    assertNotNull(dto);
    assertThat(dto).usingRecursiveComparison().isEqualTo(expected);
  }
}
