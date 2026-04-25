package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Page;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReflectionPageMapperExtendedTest {

  FakeHttpRequest http;

  @PageTitle("Extended")
  @Title("My Page")
  @Subtitle("A subtitle")
  @FavIcon("fav.ico")
  @Style("color:blue")
  @CssClasses("my-class")
  static class FullPage implements Page {
    public String name = "hello";
    public int count = 5;
    public boolean active = true;
    public LocalDate date = LocalDate.now();
    public LocalDateTime datetime = LocalDateTime.now();
    public BigDecimal amount = BigDecimal.TEN;
    public double price = 9.99;
    public Long longVal = 100L;
    public List<String> items = List.of("a", "b");

    @Button void myAction() {}
  }

  static class SimplePage implements Page {
    public String text = "value";
  }

  static class FakeApp implements App {}

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
  }

  // --- mapToPageComponent ---

  @Test void mapFullPageReturnsPage() {
    var page = mapToPageComponent(new FullPage(), "base", "route", "consumed", "init", http);
    assertNotNull(page);
    assertEquals("Extended", page.pageTitle());
    assertEquals("My Page", page.title());
    assertEquals("A subtitle", page.subtitle());
    assertEquals("fav.ico", page.favicon());
  }

  @Test void mapSimplePageReturnsPage() {
    var page = mapToPageComponent(new SimplePage(), "base", "route", "consumed", "init", http);
    assertNotNull(page);
    assertNotNull(page.pageTitle()); // defaults to humanized class name
  }

  @Test void mapPageHasContent() {
    var page = mapToPageComponent(new FullPage(), "base", "route", "consumed", "init", http);
    assertNotNull(page.content());
  }

  @Test void mapPageHasButtons() {
    var page = mapToPageComponent(new FullPage(), "base", "route", "consumed", "init", http);
    assertNotNull(page.buttons());
    assertThat(page.buttons()).isNotEmpty();
  }

  // --- getContent ---

  @Test void getContentForPage() {
    var content = getContent(new FullPage(), "base", "route", "consumed", "init", http);
    assertNotNull(content);
    assertThat(content).isNotEmpty();
  }

  // --- isApp / isPage ---

  @Test void isAppForAppClass() { assertTrue(isApp(FakeApp.class, "route")); }
  @Test void isAppForPageClass() { assertFalse(isApp(SimplePage.class, "route")); }
  @Test void isPageForPageInstance() { assertTrue(isPage(new SimplePage(), "route")); }
  @Test void isPageForAppInstance() { assertFalse(isPage(new FakeApp(), "route")); }
  @Test void isPageForPageRoute() { assertTrue(isPage(new Object(), "my_page")); }

  // --- getFormColumns ---

  @Test void getFormColumnsDefault() {
    assertThat(getFormColumns(SimplePage.class)).isGreaterThan(0);
  }

  // --- getTitle / getView ---

  @Test void getTitleFromAnnotation() {
    assertEquals("My Page", getTitle(new FullPage()));
  }

  @Test void getTitleFromClassName() {
    assertNotNull(getTitle(new SimplePage()));
  }

  @Test void isReadOnlyDefault() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    assertFalse(isReadOnly(field, new FullPage(), false));
  }

  @Test void isFormTrue() { assertTrue(isForm(new SimplePage())); }
  @Test void isFormFalseForApp() { assertFalse(isForm(new FakeApp())); }

  // --- ReflectionFormFieldMapper ---

  @Test void getFormFieldForString() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, false, 1);
    assertNotNull(component);
  }

  @Test void getFormFieldForInt() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("count");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, false, 1);
    assertNotNull(component);
  }

  @Test void getFormFieldForBoolean() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("active");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, false, 1);
    assertNotNull(component);
  }

  @Test void getFormFieldForDate() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("date");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, false, 1);
    assertNotNull(component);
  }

  @Test void getFormFieldForDecimal() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("amount");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, false, 1);
    assertNotNull(component);
  }

  @Test void getFormFieldForList() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("items");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, false, 1);
    assertNotNull(component);
  }

  @Test void getFormFieldReadOnly() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    var component = getFormField(field, new FullPage(), "base", "route", "consumed", "init", http, true, false, 1);
    assertNotNull(component);
  }

  @Test void getLabelForField() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    assertNotNull(getLabel(field));
  }

  @Test void getDataTypeForString() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    assertThat(getDataType(field)).isNotNull();
  }

  @Test void getDataTypeForInt() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("count");
    assertThat(getDataType(field)).isEqualTo(FieldDataType.integer);
  }

  @Test void getDataTypeForBoolean() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("active");
    assertThat(getDataType(field)).isEqualTo(FieldDataType.bool);
  }

  @Test void getDataTypeForDate() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("date");
    assertThat(getDataType(field)).isEqualTo(FieldDataType.date);
  }

  @Test void getStereotypeForString() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    assertThat(getStereotype(field)).isNotNull();
  }

  @Test void getDataTypeForColumnDouble() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("price");
    assertThat(getDataTypeForColumn(field)).isNotNull();
  }

  @Test void getStereotypeForColumnString() throws NoSuchFieldException {
    var field = FullPage.class.getDeclaredField("name");
    assertThat(getStereotypeForColumn(field)).isNotNull();
  }
}
