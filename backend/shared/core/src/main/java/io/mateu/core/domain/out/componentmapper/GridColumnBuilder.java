package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.*;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormPosition;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.ArrayList;

public class GridColumnBuilder {

  static Component createCrudForField(
      Field field, String prefix, boolean readOnly, HttpRequest httpRequest) {
    // Inline editing: row cells become editable inputs in the grid instead of opening a detail
    // form.
    boolean inlineEditing = !readOnly && MetaAnnotations.isPresent(field, InlineEditing.class);
    var columns = new ArrayList<GridContent>();
    getAllFields(getGenericClass(field, field.getType(), "E")).stream()
        .filter(
            columnField ->
                (!MetaAnnotations.isPresent(columnField, Hidden.class)
                        || !MetaAnnotations.find(columnField, Hidden.class).value().isEmpty())
                    && !MetaAnnotations.isPresent(columnField, HiddenInList.class)
                    && !List.class.isAssignableFrom(columnField.getType()))
        .forEach(
            columnField -> {
              var rawWidth = getColumnWidth(columnField);
              // @ColumnWidth("auto") → the column sizes to its content (header + widest cell) and
              // never truncates, adapting to the current density instead of a fixed width.
              var auto = "auto".equalsIgnoreCase(rawWidth);
              var colWidth = auto ? null : rawWidth;
              // In inline mode every data column is edited in place; a field marked @ReadOnly stays
              // display-only.
              boolean colEditable =
                  inlineEditing && !MetaAnnotations.isPresent(columnField, ReadOnly.class);
              columns.add(
                  GridColumn.builder()
                      .dataType(getDataTypeForColumn(columnField))
                      .stereotype(getStereotypeForColumn(columnField))
                      .id(columnField.getName())
                      .label(getLabel(columnField))
                      .autoWidth(auto)
                      .width(colWidth)
                      // A fixed @ColumnWidth (or an auto column) does not flex-grow; columns
                      // without
                      // any @ColumnWidth keep the default flex-grow so they share the remaining
                      // space.
                      .flexGrow(auto || colWidth != null ? "0" : null)
                      .filterable(getFilterable(columnField))
                      .editable(colEditable)
                      .editorType(colEditable ? getEditorType(columnField) : null)
                      .editorOptions(
                          colEditable ? getEditorOptions(columnField, httpRequest) : null)
                      .build());
            });
    // The per-row "Edit" button opens the detail form; inline editing replaces it.
    if (!readOnly && !inlineEditing) {
      columns.add(
          GridColumn.builder()
              .dataType(FieldDataType.string)
              .stereotype(FieldStereotype.button)
              .id("_select")
              .label("")
              .text("Edit")
              .actionId(getFieldId(field, prefix, readOnly) + "_select")
              .width("3rem")
              .build());
    }
    String detailPath = getDetailPath(field);
    return FormField.builder()
        .id(getFieldId(field, prefix, readOnly))
        .dataType(FieldDataType.array)
        .stereotype(FieldStereotype.grid)
        .readOnly(readOnly)
        .detailPath(detailPath)
        .useButtonForDetail(detailPath != null)
        .label(getLabel(field))
        .columns(columns)
        .inlineEditing(inlineEditing)
        .style(getStyleForArray(field))
        .colspan(getColspan(field, null, null))
        .itemIdPath("_rowNumber")
        .onItemSelectionActionId(getOnItemSelectionActionId(field, prefix, readOnly))
        .rowSelectionShortcut(getRowSelectionShortcut(field))
        .formPosition(getFormPosition(field))
        .formStyle(getFormStyle(field))
        .formTheme(getFormTheme(field))
        .formColumns(getDetailFormColumns(field))
        .readOnly(readOnly)
        .minHeightWhenDetailVisible(getMinHeightWhenDetailVisible(field))
        .optionsColumns(getOptionsColumns(field))
        .build();
  }

  /**
   * Action id fired when a grid row is selected. With {@link OnRowSelected} the field binds
   * selection to a developer method (and works even on read-only grids); the id is routed to that
   * method via the {@code nested-form-action-} scheme when the grid lives inside a nested section.
   * Without it, keeps the legacy CRUD behaviour: {@code <fieldId>_selected} for editable grids,
   * nothing for read-only ones.
   */
  private static String getOnItemSelectionActionId(Field field, String prefix, boolean readOnly) {
    if (MetaAnnotations.isPresent(field, OnRowSelected.class)) {
      var method = MetaAnnotations.find(field, OnRowSelected.class).value();
      return (prefix == null || prefix.isEmpty())
          ? method
          : "nested-form-action-" + prefix + method;
    }
    return readOnly ? null : getFieldId(field, prefix, readOnly) + "_selected";
  }

  /**
   * Keyboard-shortcut base for selecting a row by position (see {@link OnRowSelected#shortcut()}).
   */
  private static String getRowSelectionShortcut(Field field) {
    if (MetaAnnotations.isPresent(field, OnRowSelected.class)) {
      var shortcut = MetaAnnotations.find(field, OnRowSelected.class).shortcut();
      return shortcut == null || shortcut.isEmpty() ? null : shortcut;
    }
    return null;
  }

  public static int getDetailFormColumns(Field field) {
    if (MetaAnnotations.isPresent(field, DetailFormCustomisation.class)) {
      var columns = MetaAnnotations.find(field, DetailFormCustomisation.class).columns();
      if (columns != 2) {
        return columns;
      }
    }
    return getFormColumns(getGenericClass(field, field.getType(), "E"));
  }

  /**
   * The inline-cell editor to use for a column, derived from the element field's real Java type
   * (the coarse column {@code dataType} collapses most types to {@code string}).
   */
  private static String getEditorType(Field columnField) {
    if (columnField.getType().isEnum() || MetaAnnotations.isPresent(columnField, Lookup.class)) {
      return "select";
    }
    if (MetaAnnotations.isPresent(columnField, io.mateu.uidl.annotations.Stereotype.class)
        && MetaAnnotations.find(columnField, io.mateu.uidl.annotations.Stereotype.class).value()
            == io.mateu.uidl.data.FieldStereotype.money) {
      return "number";
    }
    return switch (getDataType(columnField)) {
      case bool -> "boolean";
      case integer -> "integer";
      case number, money -> "number";
      case date -> "date";
      case dateTime -> "datetime";
      case time -> "time";
      default -> "text";
    };
  }

  /**
   * Options for a {@code select} editor: the constants of an enum column, or the options a
   * {@code @Lookup} field resolves through its {@code LookupOptionsSupplier} (the initial page).
   */
  private static java.util.List<io.mateu.uidl.data.Option> getEditorOptions(
      Field columnField, HttpRequest httpRequest) {
    if (columnField.getType().isEnum()) {
      return java.util.Arrays.stream(columnField.getType().getEnumConstants())
          .map(c -> new io.mateu.uidl.data.Option(((Enum<?>) c).name(), c.toString()))
          .toList();
    }
    if (MetaAnnotations.isPresent(columnField, Lookup.class)) {
      var supplier =
          io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.getLookupOptionsSupplier(
              null, columnField);
      if (supplier != null) {
        var listing =
            supplier.search(
                columnField.getName(),
                "",
                new io.mateu.uidl.data.Pageable(0, 200, java.util.List.of()),
                httpRequest);
        if (listing != null && listing.page() != null) {
          return listing.page().content();
        }
      }
    }
    return null;
  }

  private static String getColumnWidth(Field columnField) {
    if (MetaAnnotations.isPresent(columnField, ColumnWidth.class)) {
      return MetaAnnotations.find(columnField, ColumnWidth.class).value();
    }
    return null;
  }

  private static boolean getFilterable(Field columnField) {
    return MetaAnnotations.isPresent(columnField, Filterable.class);
  }

  private static String getDetailPath(Field field) {
    return getAllFields(getGenericClass(field, field.getType(), "E")).stream()
        .filter(columnField -> MetaAnnotations.isPresent(columnField, Details.class))
        .map(Field::getName)
        .findFirst()
        .orElse(null);
  }

  private static String getFormTheme(Field field) {
    return DetailFormCustomisationExtractor.getFormTheme(field);
  }

  private static String getFormStyle(Field field) {
    return DetailFormCustomisationExtractor.getFormStyle(field);
  }

  private static FormPosition getFormPosition(Field field) {
    return DetailFormCustomisationExtractor.getFormPosition(field);
  }

  private static String getMinHeightWhenDetailVisible(Field field) {
    return DetailFormCustomisationExtractor.getMinHeightWhenDetailVisible(field);
  }

  private static String getStyleForArray(Field field) {
    var style = getStyle(field, null, null);
    if (style != null && !style.isEmpty()) {
      return style;
    }
    return "min-width: 10rem; width: 100%;";
  }
}
