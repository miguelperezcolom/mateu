package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Page;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReflectionObjectToComponentMapperExtendedTest {

  FakeHttpRequest http;
  ReflectionObjectToComponentMapper mapper;

  static class PageImpl implements Page {}

  static class FormPageImpl implements Page {
    public String name = "test";
  }

  @UI("/myapp")
  static class AppImpl implements App {}

  static class PlainObject {}

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
    new DefaultInstanceFactory(new ReflectionInstanceFactory(new FakeBeanProvider()));
    mapper = new ReflectionObjectToComponentMapper();
  }

  private Object map(Object instance) {
    return mapper.mapToComponent(instance, "base", "route", "consumed", "init", http);
  }

  @Test
  void mapPageReturnsUIFragmentDto() {
    var result = map(new PageImpl());
    assertThat(result).isInstanceOf(UIFragmentDto.class);
  }

  @Test
  void mapFormPageReturnsUIFragmentDto() {
    var result = map(new SimpleForm());
    assertThat(result).isNotNull();
  }

  @Test
  void mapServerSideComponentDtoPassesThrough() {
    var dto = new ServerSideComponentDto("id", "type", List.of(), null, "", "", List.of(), List.of(), List.of(), List.of(), null);
    var result = map(dto);
    assertThat(result).isInstanceOf(UIFragmentDto.class);
  }

  @Test
  void mapPlainObjectReturnsItself() {
    var obj = new PlainObject();
    var result = map(obj);
    assertThat(result).isEqualTo(obj);
  }

  @Test
  void isPageForPageInstance() {
    assertThat(ReflectionObjectToComponentMapper.isPage(new PageImpl(), "route")).isTrue();
  }

  @Test
  void isPageForPageRoute() {
    assertThat(ReflectionObjectToComponentMapper.isPage(new Object(), "my_page")).isTrue();
  }

  @Test
  void isPageFalseForNull() {
    assertThat(ReflectionObjectToComponentMapper.isPage(null, "route")).isFalse();
  }

  @Test
  void isAppForAppClass() {
    assertThat(ReflectionObjectToComponentMapper.isApp(AppImpl.class, "route")).isTrue();
  }

  @Test
  void isAppFalseForPlainClass() {
    assertThat(ReflectionObjectToComponentMapper.isApp(PlainObject.class, "route")).isFalse();
  }

  @Test
  void isAppFalseForPageClass() {
    assertThat(ReflectionObjectToComponentMapper.isApp(PageImpl.class, "route")).isFalse();
  }

  // --- ReflectionComponentMapper ---

  @Test
  void mapNullReturnsNull() {
    assertThat(ReflectionComponentMapper.mapToComponent(null, "base", "route", "init", http)).isNull();
  }

  @Test
  void mapComponentReturnsItself() {
    var text = new Text("hello");
    var result = ReflectionComponentMapper.mapToComponent(text, "base", "route", "init", http);
    assertThat(result).isEqualTo(text);
  }

  @Test
  void mapListReturnsHorizontalLayout() {
    var result = ReflectionComponentMapper.mapToComponent(
        List.of(new Text("a"), new Text("b")), "base", "route", "init", http);
    assertThat(result).isInstanceOf(HorizontalLayout.class);
  }

  @Test
  void mapStringReturnsTextComponent() {
    var result = ReflectionComponentMapper.mapToComponent("hello", "base", "route", "init", http);
    assertThat(result).isInstanceOf(Text.class);
  }

  @Test
  void mapIntegerReturnsTextComponent() {
    var result = ReflectionComponentMapper.mapToComponent(42, "base", "route", "init", http);
    assertThat(result).isInstanceOf(Text.class);
  }
}
