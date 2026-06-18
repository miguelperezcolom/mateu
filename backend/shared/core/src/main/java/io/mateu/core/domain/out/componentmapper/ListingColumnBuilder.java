package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getDataTypeForColumn;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getStereotypeForColumn;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Priority;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Weight;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Selector;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import io.mateu.uidl.layout.WeightEstimator;
import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;

final class ListingColumnBuilder {

  private static final WeightEstimator WEIGHT_ESTIMATOR = new WeightEstimator();

  static Collection<? extends GridContent> getColumns(
      Class<?> rowClass,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var columns = new ArrayList<GridColumn>();
    columns.addAll(
        getAllFields(rowClass).stream()
            .filter(field -> filterColumn(field, instance, httpRequest))
            .map(
                field ->
                    getColumn(field, instance, baseUrl, route, initiatorComponentId, httpRequest))
            .toList());
    if (instance instanceof Selector<?>) {
      columns.add(
          GridColumn.builder()
              .id("select")
              .label("Select")
              .dataType(FieldDataType.action)
              .stereotype(FieldStereotype.button)
              .style("")
              .resizable(false)
              .build());
    }
    return columns;
  }

  private static boolean filterColumn(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof VisibilitySupplier visibilitySupplier
        && visibilitySupplier.isHidden(field.getName(), httpRequest)) return false;
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
    Integer priority = null;
    boolean identifier = false;
    if (field.isAnnotationPresent(Priority.class)) {
      var p = field.getAnnotation(Priority.class);
      priority = p.value();
      identifier = p.identifier();
    }
    Double weight = null;
    if (field.isAnnotationPresent(Weight.class)) {
      weight = field.getAnnotation(Weight.class).value();
    } else if (field.isAnnotationPresent(ColumnWidth.class)) {
      weight = WEIGHT_ESTIMATOR.parsePx(field.getAnnotation(ColumnWidth.class).value());
    }
    return GridColumn.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataTypeForColumn(field))
        .stereotype(getStereotypeForColumn(field))
        .style(getColumnStyle(field))
        .resizable(true)
        .priority(priority)
        .identifier(identifier)
        .weight(weight)
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
