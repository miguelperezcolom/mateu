package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.Test;

/**
 * Inline-editing grids ({@link InlineEditing}) pick a per-column editor from each column field's
 * real Java type, drop the per-row "Edit" button, and only eager-load options for enum {@code
 * select} editors (never for remote {@code lookup} editors).
 */
class GridColumnBuilderTest {

  enum Priority {
    LOW,
    HIGH
  }

  static class Row {
    String product;
    int quantity;
    double price;
    boolean active;
    Priority priority;
    @Lookup String supplierId;
    @ReadOnly String code;
  }

  static class InlineHost {
    @InlineEditing
    @Stereotype(FieldStereotype.grid)
    List<Row> lines;
  }

  static class PlainHost {
    @Stereotype(FieldStereotype.grid)
    List<Row> lines;
  }

  private static FakeHttpRequest httpRequest() {
    return new FakeHttpRequest(RunActionRqDto.builder().build());
  }

  private static Map<String, GridColumn> columnsById(Object host) throws Exception {
    var field = host.getClass().getDeclaredField("lines");
    var component = GridColumnBuilder.createCrudForField(field, "", false, host, httpRequest());
    var formField = (FormField) component;
    Function<GridColumn, String> id = GridColumn::id;
    return formField.columns().stream()
        .map(c -> (GridColumn) c)
        .collect(java.util.stream.Collectors.toMap(id, c -> c, (a, b) -> a));
  }

  @Test
  void picksEditorTypeFromTheColumnJavaType() throws Exception {
    var cols = columnsById(new InlineHost());

    assertThat(cols.get("product").editorType()).isEqualTo("text");
    assertThat(cols.get("quantity").editorType()).isEqualTo("integer");
    assertThat(cols.get("price").editorType()).isEqualTo("number");
    assertThat(cols.get("active").editorType()).isEqualTo("boolean");
    assertThat(cols.get("priority").editorType()).isEqualTo("select");
    assertThat(cols.get("supplierId").editorType()).isEqualTo("lookup");
  }

  @Test
  void eagerLoadsOptionsOnlyForEnumSelectEditors() throws Exception {
    var cols = columnsById(new InlineHost());

    // enum select → its constants are shipped eagerly
    assertThat(cols.get("priority").editorOptions())
        .extracting("value")
        .containsExactly("LOW", "HIGH");
    // remote lookup → no eager options (the frontend loads them lazily via search-as-you-type)
    assertThat(cols.get("supplierId").editorOptions()).isNull();
    // scalars → no options at all
    assertThat(cols.get("product").editorOptions()).isNull();
  }

  @Test
  void readOnlyColumnStaysNonEditableInInlineMode() throws Exception {
    var cols = columnsById(new InlineHost());

    assertThat(cols.get("code").editable()).isFalse();
    assertThat(cols.get("code").editorType()).isNull();
    assertThat(cols.get("product").editable()).isTrue();
  }

  @Test
  void inlineGridHasNoSelectEditColumnAndIsMarkedInline() throws Exception {
    var field = InlineHost.class.getDeclaredField("lines");
    var formField =
        (FormField)
            GridColumnBuilder.createCrudForField(field, "", false, new InlineHost(), httpRequest());

    assertThat(formField.inlineEditing()).isTrue();
    assertThat(formField.columns()).noneMatch(c -> "_select".equals(((GridColumn) c).id()));
  }

  @Test
  void plainGridKeepsTheEditButtonAndNoInlineEditors() throws Exception {
    var field = PlainHost.class.getDeclaredField("lines");
    var formField =
        (FormField)
            GridColumnBuilder.createCrudForField(field, "", false, new PlainHost(), httpRequest());

    assertThat(formField.inlineEditing()).isFalse();
    assertThat(formField.columns()).anyMatch(c -> "_select".equals(((GridColumn) c).id()));
    assertThat(formField.columns())
        .filteredOn(c -> !"_select".equals(((GridColumn) c).id()))
        .allMatch(c -> !((GridColumn) c).editable());
  }
}
