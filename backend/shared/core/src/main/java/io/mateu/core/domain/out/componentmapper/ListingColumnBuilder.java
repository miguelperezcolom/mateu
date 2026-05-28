package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getDataTypeForColumn;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getStereotypeForColumn;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.util.Collection;

final class ListingColumnBuilder {

  static Collection<? extends GridContent> getColumns(
      Class<?> rowClass,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return getAllFields(rowClass).stream()
        .filter(ListingColumnBuilder::filterColumn)
        .map(field -> getColumn(field, instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static boolean filterColumn(Field field) {
    if (field.isAnnotationPresent(Hidden.class)) return false;
    if (field.isAnnotationPresent(HiddenInList.class)) return false;
    if (field.isAnnotationPresent(Menu.class)) return false;
    if (Collection.class.isAssignableFrom(field.getType())) return false;
    return true;
  }

  private static GridColumn getColumn(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return GridColumn.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataTypeForColumn(field))
        .stereotype(getStereotypeForColumn(field))
        .style(getColumnStyle(field))
        .build();
  }

  private static String getColumnStyle(AccessibleObject field) {
    if (field.isAnnotationPresent(Style.class)) {
      return field.getAnnotation(Style.class).value();
    }
    return "";
  }

  private ListingColumnBuilder() {}
}
