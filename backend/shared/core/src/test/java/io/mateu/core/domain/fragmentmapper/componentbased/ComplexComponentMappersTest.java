package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.ListingType;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.IconKey;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ComplexComponentMappersTest {

  private static final String B = "base";
  private static final String R = "route";
  private static final String C = "consumed";
  private static final String I = "init";
  private FakeHttpRequest http;

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
    new DefaultInstanceFactory(new ReflectionInstanceFactory(new FakeBeanProvider()));
  }

  private Object map(Component c) {
    return mapComponentToDto(null, c, B, R, C, I, http);
  }

  // --- fluent.Page ---
  @Test void fluentPageEmpty() {
    assertThat(map(Page.builder().build())).isNotNull();
  }

  @Test void fluentPageWithContent() {
    assertThat(map(Page.builder()
        .pageTitle("Title").title("My Page").subtitle("sub")
        .contentItem(new Text("body"))
        .toolbarItem(Button.builder().label("Save").actionId("save").build())
        .build())).isNotNull();
  }

  @Test void fluentPageWithBreadcrumbs() {
    assertThat(map(Page.builder()
        .breadcrumbs(List.of(new Breadcrumb("Home", "/"), new Breadcrumb("Items", "/items")))
        .build())).isNotNull();
  }

  @Test void fluentPageWithAvatar() {
    assertThat(map(Page.builder()
        .avatar(Icon.builder().icon(IconKey.Abacus).build())
        .build())).isNotNull();
  }

  @Test void fluentPageWithBadgesAndKpis() {
    assertThat(map(Page.builder()
        .badgeItem(Badge.builder().text("new").build())
        .kpiItem(new KPI("Revenue", "1M"))
        .build())).isNotNull();
  }

  // --- fluent.Form ---
  @Test void fluentFormEmpty() {
    assertThat(map(Form.builder().build())).isNotNull();
  }

  @Test void fluentFormWithContent() {
    assertThat(map(Form.builder()
        .title("Form").subtitle("sub").noHeader(false)
        .contentItem(new Text("field"))
        .toolbarItem(Button.builder().label("Save").actionId("save").build())
        .build())).isNotNull();
  }

  @Test void fluentFormNoHeader() {
    assertThat(map(Form.builder().noHeader(true).build())).isNotNull();
  }

  // --- Listing ---
  @Test void listingEmpty() {
    assertThat(map(Listing.builder().listingType(ListingType.table).build())).isNotNull();
  }

  @Test void listingWithColumns() {
    assertThat(map(Listing.builder()
        .listingType(ListingType.table)
        .title("Items")
        .columns(List.of(GridColumn.builder().id("name").label("Name").build()))
        .build())).isNotNull();
  }

  @Test void listingCard() {
    assertThat(map(Listing.builder().listingType(ListingType.card).build())).isNotNull();
  }

  // --- Grid ---
  @Test void gridEmpty() {
    assertThat(map(Grid.builder().build())).isNotNull();
  }

  @Test void gridWithColumns() {
    assertThat(map(Grid.builder()
        .content(List.of(GridColumn.builder().id("id").label("ID").build()))
        .compact(true).noBorder(false).rowStripes(true)
        .build())).isNotNull();
  }

  // --- FormField ---
  @Test void formFieldMinimal() {
    assertThat(map(FormField.builder()
        .id("name").label("Name")
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.regular)
        .build())).isNotNull();
  }

  @Test void formFieldReadOnly() {
    assertThat(map(FormField.builder()
        .id("name").readOnly(true)
        .dataType(FieldDataType.string)
        .build())).isNotNull();
  }

  @Test void formFieldWithOptions() {
    assertThat(map(FormField.builder()
        .id("type")
        .dataType(FieldDataType.string)
        .options(List.of(
            new Option("opt1", "Option 1"),
            new Option("opt2", "Option 2")))
        .build())).isNotNull();
  }

  @Test void formFieldDate() {
    assertThat(map(FormField.builder()
        .id("date").dataType(FieldDataType.date).build())).isNotNull();
  }

  @Test void formFieldBoolean() {
    assertThat(map(FormField.builder()
        .id("active").dataType(FieldDataType.bool).build())).isNotNull();
  }

  @Test void formFieldInteger() {
    assertThat(map(FormField.builder()
        .id("count").dataType(FieldDataType.integer).build())).isNotNull();
  }

  @Test void formFieldExternalFile() {
    assertThat(map(FormField.builder()
        .id("file").dataType(FieldDataType.string)
        .stereotype(FieldStereotype.image)
        .build())).isNotNull();
  }

  // --- DirectoryComponentToDtoMapper ---
  @Test void directory() {
    assertThat(map(Directory.builder()
        .menu(List.of())
        .build())).isNotNull();
  }

  // --- GridColumn / GridGroupColumn ---
  @Test void gridColumn() {
    assertThat(map(GridColumn.builder().id("id").label("ID").build())).isNotNull();
  }

  @Test void gridGroupColumn() {
    assertThat(map(GridGroupColumn.builder()
        .label("Group")
        .columns(List.of(GridColumn.builder().id("a").label("A").build()))
        .build())).isNotNull();
  }
}
