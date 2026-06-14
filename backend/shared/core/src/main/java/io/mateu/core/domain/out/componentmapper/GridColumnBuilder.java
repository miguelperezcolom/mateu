package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.*;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

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
    var columns = new ArrayList<GridContent>();
    getAllFields(getGenericClass(field, field.getType(), "E")).stream()
        .filter(
            columnField ->
                (!columnField.isAnnotationPresent(Hidden.class)
                        || !columnField.getAnnotation(Hidden.class).value().isEmpty())
                    && !columnField.isAnnotationPresent(HiddenInList.class)
                    && !List.class.isAssignableFrom(columnField.getType()))
        .forEach(
            columnField ->
                columns.add(
                    GridColumn.builder()
                        .dataType(getDataTypeForColumn(columnField))
                        .stereotype(getStereotypeForColumn(columnField))
                        .id(columnField.getName())
                        .label(getLabel(columnField))
                        .width(getColumnWidth(columnField))
                        .filterable(getFilterable(columnField))
                        .build()));
    if (!readOnly) {
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
        .style(getStyleForArray(field))
        .colspan(getColspan(field))
        .itemIdPath("_rowNumber")
        .onItemSelectionActionId(
            readOnly ? null : getFieldId(field, prefix, readOnly) + "_selected")
        .formPosition(getFormPosition(field))
        .formStyle(getFormStyle(field))
        .formTheme(getFormTheme(field))
        .formColumns(getDetailFormColumns(field))
        .readOnly(readOnly)
        .minHeightWhenDetailVisible(getMinHeightWhenDetailVisible(field))
        .optionsColumns(getOptionsColumns(field))
        .build();
  }

  public static int getDetailFormColumns(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      var columns = field.getAnnotation(DetailFormCustomisation.class).columns();
      if (columns != 2) {
        return columns;
      }
    }
    return getFormColumns(getGenericClass(field, field.getType(), "E"));
  }

  private static String getColumnWidth(Field columnField) {
    if (columnField.isAnnotationPresent(ColumnWidth.class)) {
      return columnField.getAnnotation(ColumnWidth.class).value();
    }
    return null;
  }

  private static boolean getFilterable(Field columnField) {
    return columnField.isAnnotationPresent(Filterable.class);
  }

  private static String getDetailPath(Field field) {
    return getAllFields(getGenericClass(field, field.getType(), "E")).stream()
        .filter(columnField -> columnField.isAnnotationPresent(Details.class))
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
