package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.forms.SimpleForm;
import com.example.uis.travel.BookingsCrud;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.Page;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReflectionPageMapperColumnsAndFormTest {

  FakeHttpRequest http;

  static class SampleRow {
    public String name = "Alice";
    public int age = 30;
    public LocalDate birthDate = LocalDate.now();
    public double salary = 50000.0;
    public boolean active = true;
    public Status status = new Status(StatusType.SUCCESS, "Active");
    public Amount amount = new Amount("USD", 100.0);

    @Hidden
    public String hidden = "hidden";

    @HiddenInList
    public String hiddenInList = "hiddenInList";
  }

  static class SampleFilters {
    public String nameFilter = "";
    public boolean activeFilter = false;
  }

  @Section("Personal")
  static class SectionedForm implements Page {
    @Section("Personal")
    public String firstName = "John";

    public String lastName = "Doe";

    @Section("Contact")
    public String email = "john@example.com";

    public String phone = "555-0100";
  }

  static class MultiTabForm implements Page {
    @Tab("Basic")
    public String name = "test";

    @Tab("Details")
    public String description = "desc";
  }

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
    new DefaultInstanceFactory(new ReflectionInstanceFactory(new FakeBeanProvider()));
  }

  // --- getColumns ---

  @Test
  void getColumnsForSampleRow() {
    var cols = getColumns(SampleRow.class, new SampleRow(), "base", "route", "init", http);
    assertThat(cols).isNotNull();
    assertThat(cols).isNotEmpty();
  }

  @Test
  void getColumnsExcludesHiddenFields() {
    var cols = getColumns(SampleRow.class, new SampleRow(), "base", "route", "init", http);
    var names = cols.stream().map(c -> c.id()).toList();
    assertThat(names).doesNotContain("hidden");
  }

  @Test
  void getColumnsExcludesHiddenInListFields() {
    var cols = getColumns(SampleRow.class, new SampleRow(), "base", "route", "init", http);
    var names = cols.stream().map(c -> c.id()).toList();
    assertThat(names).doesNotContain("hiddenInList");
  }

  @Test
  void getColumnsIncludesStatus() {
    var cols = getColumns(SampleRow.class, new SampleRow(), "base", "route", "init", http);
    var names = cols.stream().map(c -> c.id()).toList();
    assertThat(names).contains("status");
  }

  // --- getFilters ---

  @Test
  void getFiltersForSampleFilters() {
    var filters =
        getFilters(SampleFilters.class, new SampleFilters(), "base", "route", "consumed", "init", http);
    assertThat(filters).isNotNull();
    assertThat(filters).isNotEmpty();
  }

  // --- getForm ---

  @Test
  void getFormForSimpleForm() {
    var form =
        getForm(new SimpleForm(), "base", "route", "consumed", "init", http, false, false, 2);
    assertThat(form).isNotNull();
    assertThat(form).isNotEmpty();
  }

  @Test
  void getFormReadOnly() {
    var form =
        getForm(new SimpleForm(), "base", "route", "consumed", "init", http, false, true, 2);
    assertThat(form).isNotNull();
  }

  @Test
  void getFormForCreationForm() {
    var form =
        getForm(new SimpleForm(), "base", "route", "consumed", "init", http, true, false, 2);
    assertThat(form).isNotNull();
  }

  @Test
  void getFormForSectionedForm() {
    var form =
        getForm(new SectionedForm(), "base", "route", "consumed", "init", http, false, false, 2);
    assertThat(form).isNotNull();
    assertThat(form).isNotEmpty();
  }

  // --- toFormLayout ---

  @Test
  void toFormLayoutForPage() {
    var layout =
        toFormLayout(
            new SimpleForm(), "base", "route", "consumed", "init", http, false, false, 2, "");
    assertThat(layout).isNotNull();
  }

  @Test
  void toFormLayoutReadOnly() {
    var layout =
        toFormLayout(
            new SimpleForm(), "base", "route", "consumed", "init", http, false, true, 2, "");
    assertThat(layout).isNotNull();
  }

  // --- getView ---

  @Test
  void getViewForForm() {
    var view = getView(new SimpleForm(), "base", "route", "consumed", "init", http);
    assertThat(view).isNotNull();
  }

  // --- getFormColumns ---

  @Test
  void getFormColumnsForSimpleForm() {
    assertThat(getFormColumns(SimpleForm.class)).isGreaterThan(0);
  }

  @Test
  void getFormColumnsForSectionedForm() {
    assertThat(getFormColumns(SectionedForm.class)).isGreaterThan(0);
  }
}
