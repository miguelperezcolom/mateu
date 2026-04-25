package io.mateu.core.infra.reflection.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.domain.out.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Page;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReflectionUiIncrementMapperTest {

  ReflectionUiIncrementMapper mapper;
  FakeHttpRequest http;

  static class SimplePageImpl implements Page {}

  static class SimpleAppImpl implements App {}

  @BeforeEach
  void setUp() {
    var beanProvider = new FakeBeanProvider();
    new DefaultInstanceFactory(new ReflectionInstanceFactory(beanProvider));
    mapper =
        new ReflectionUiIncrementMapper(
            new ComponentFragmentMapper(), new ReflectionObjectToComponentMapper());
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
  }

  @Test
  void supportsPage() {
    assertThat(mapper.supports(new SimplePageImpl())).isTrue();
  }

  @Test
  void supportsForm() {
    assertThat(mapper.supports(new SimpleForm())).isTrue();
  }

  @Test
  void supportsApp() {
    assertThat(mapper.supports(new SimpleAppImpl())).isTrue();
  }

  @Test
  void removeQueryParamsFromRouteStripsParams() {
    assertThat(ReflectionUiIncrementMapper.removeQueryParamsFromRoute("/items?page=1"))
        .isEqualTo("/items");
  }

  @Test
  void removeQueryParamsFromRouteNoParams() {
    assertThat(ReflectionUiIncrementMapper.removeQueryParamsFromRoute("/items"))
        .isEqualTo("/items");
  }

  @Test
  void removeQueryParamsFromRouteEmpty() {
    assertThat(ReflectionUiIncrementMapper.removeQueryParamsFromRoute("")).isEqualTo("");
  }

  @Test
  void mapPageReturnsIncrement() {
    http.storeRunActionRqDto(
        RunActionRqDto.builder()
            .componentState(Map.of())
            .route("/page")
            .initiatorComponentId("init")
            .consumedRoute("")
            .build());
    var result =
        mapper.map(new SimplePageImpl(), "base", "/page", "consumed", "init", http).block();
    assertThat(result).isNotNull();
  }
}
