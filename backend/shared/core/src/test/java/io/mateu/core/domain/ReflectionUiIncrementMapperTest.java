package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.domain.fragmentmapper.ReflectionFragmentMapper;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.MapsToDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReflectionUiIncrementMapperTest {

  @Test
  void mapsToNull() {
    var mapper = new ReflectionUiIncrementMapper(new ReflectionFragmentMapper());
    var result = mapper.map(null, "base_url", new FakeHttpRequest()).block();
    assertNull(result);
  }

  @Test
  void mapsToSelf() {
    var mapper = new ReflectionUiIncrementMapper(new ReflectionFragmentMapper());
    var dto = new UIIncrementDto(List.of(), List.of(), List.of(), Map.of());
    var result = mapper.map(dto, "base_url", new FakeHttpRequest()).block();
    assertEquals(dto, result);
  }

  @Test
  void callsMethod() {
    var mapper = new ReflectionUiIncrementMapper(new ReflectionFragmentMapper());
    var dto = new UIIncrementDto(List.of(), List.of(), List.of(), Map.of());
    var instance =
        new MapsToDto() {

          @Override
          public UIIncrementDto toUIIncrementDto() {
            return dto;
          }
        };
    var result = mapper.map(instance, "base_url", new FakeHttpRequest()).block();
    assertEquals(dto, result);
  }
}
