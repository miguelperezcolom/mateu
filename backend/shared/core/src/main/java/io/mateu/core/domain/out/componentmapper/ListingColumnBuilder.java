package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getCaptionPathForColumn;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getDataTypeForListingColumn;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getLeadingPathForColumn;
import static io.mateu.core.domain.out.componentmapper.FieldTypeMapper.getStereotypeForColumn;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Details;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Line;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Priority;
import io.mateu.uidl.annotations.ReadOnly;
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
    // a grouped listing keeps its rows in group order (the group column is its primary sort): a
    // header sort would reorder the rows across the group markers, so it offers none
    boolean grouped =
        getAllFields(rowClass).stream()
            .anyMatch(
                field -> MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.GroupBy.class));
    var shown =
        getAllFields(rowClass).stream()
            .filter(field -> filterColumn(field, instance, httpRequest))
            .toList();
    // A row's action columns (ColumnAction / ColumnActionGroup) that come after every data column
    // are frozen to the END: a row with many fields is a wide grid, and its "Run" / "Edit" button
    // sat past the right edge, behind the horizontal scroll. The same rule the editable grid's
    // row-editor button follows (freezeRowEditorButton). An action column placed among the data
    // columns is where its author put it, and stays there.
    int lastDataColumn = -1;
    for (int i = 0; i < shown.size(); i++) if (!isActionField(shown.get(i))) lastDataColumn = i;
    for (int i = 0; i < shown.size(); i++) {
      var column =
          getColumn(shown.get(i), instance, baseUrl, route, initiatorComponentId, httpRequest);
      if (!grouped) column = column.toBuilder().sortable(isSortable(rowClass, column)).build();
      if (i > lastDataColumn) column = column.toBuilder().frozenToEnd(true).build();
      columns.add(column);
    }
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

  private static boolean isActionField(Field field) {
    return io.mateu.uidl.data.ColumnAction.class.equals(field.getType())
        || io.mateu.uidl.data.ColumnActionGroup.class.equals(field.getType());
  }

  /**
   * The row detail of a listing: the first field of the row marked {@link Details}. It is left out
   * of the columns and shown under the row when the row is clicked — the place for what is too long
   * for a cell (a payload, a message body) and only wanted one row at a time.
   */
  static String getDetailPath(Class<?> rowClass) {
    if (rowClass == null) return null;
    return getAllFields(rowClass).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Details.class))
        .map(Field::getName)
        .findFirst()
        .orElse(null);
  }

  private static boolean filterColumn(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof VisibilitySupplier visibilitySupplier
        && visibilitySupplier.isHidden(field.getName(), httpRequest)) return false;
    if (MetaAnnotations.isPresent(field, Hidden.class)) return false;
    if (MetaAnnotations.isPresent(field, HiddenInList.class)) return false;
    // @EyesOnly + @Audience: the same rule as a form field (its value is not sent either, see
    // DataMapper)
    if (!io.mateu.core.domain.FieldAccess.isShown(field, httpRequest)) return false;
    if (MetaAnnotations.isPresent(field, Menu.class)) return false;
    // the row detail is not a column: it is what opens under the row (see detailPath)
    if (MetaAnnotations.isPresent(field, Details.class)) return false;
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
    if (MetaAnnotations.isPresent(field, Priority.class)) {
      var p = MetaAnnotations.find(field, Priority.class);
      priority = p.value();
      identifier = p.identifier();
    }
    Double weight = null;
    if (MetaAnnotations.isPresent(field, Weight.class)) {
      weight = MetaAnnotations.find(field, Weight.class).value();
    } else if (MetaAnnotations.isPresent(field, ColumnWidth.class)
        && !"auto".equalsIgnoreCase(MetaAnnotations.find(field, ColumnWidth.class).value())) {
      weight = WEIGHT_ESTIMATOR.parsePx(MetaAnnotations.find(field, ColumnWidth.class).value());
    } else {
      // sin anotación: estima el peso con el TIPO FINO del campo — el dataType de columna
      // del wire es grueso (números y fechas colapsan a string) y el heurístico de layout
      // del renderer sobreestimaría esas columnas (p.ej. un listado de contadores saltaba
      // a cards cuando cabe de sobra como tabla)
      weight =
          WEIGHT_ESTIMATOR.base(FieldTypeMapper.getDataType(field), getStereotypeForColumn(field));
    }
    String rawWidth =
        MetaAnnotations.isPresent(field, ColumnWidth.class)
            ? MetaAnnotations.find(field, ColumnWidth.class).value()
            : null;
    // @ColumnWidth("auto") sizes the column to its content (header + widest cell), as in a form's
    // grid (GridColumnBuilder): it is autoWidth, not a CSS width of "auto" — which every renderer
    // read as a fixed width it could not parse, while the unannotated column got the autoWidth.
    boolean autoWidth = "auto".equalsIgnoreCase(rawWidth);
    String columnWidth = autoWidth ? null : rawWidth;
    // Inline row editing: when the listing class is annotated @InlineEditing, every data column
    // (except the ones a saved row never takes from the client) is edited in place; commits
    // dispatch the crud's update-row action.
    boolean editable =
        instance != null
            && MetaAnnotations.isPresent(instance.getClass(), InlineEditing.class)
            && isEditableInARow(field);
    return GridColumn.builder()
        .id(field.getName())
        .label(getLabel(field))
        .dataType(getDataTypeForListingColumn(field))
        .stereotype(getStereotypeForColumn(field))
        .captionPath(getCaptionPathForColumn(field))
        .leadingPath(getLeadingPathForColumn(field))
        .style(getColumnStyle(field))
        .resizable(true)
        .priority(priority)
        .identifier(identifier)
        .weight(weight)
        // @ColumnWidth is a width here too, as in a form's grid (GridColumnBuilder): the column
        // keeps it instead of growing with its longest cell, which pushed the columns to its
        // right off the screen. What the width cuts is read on hover.
        .autoWidth(autoWidth)
        .width(columnWidth)
        .flexGrow(autoWidth || columnWidth != null ? "0" : null)
        // @Tooltip("otherField"): hovering the cell shows another field of the row (a breakdown);
        // without it, a fixed-width column shows its own text, which the width may cut
        .tooltipPath(tooltipPathOf(field, columnWidth))
        .editable(editable)
        .editorType(editable ? GridColumnBuilder.getEditorType(field) : null)
        .editorOptions(editable ? GridColumnBuilder.getEditorOptions(field) : null)
        // an enum column's cells read as its labels ("In house"), not the raw constant
        .valueLabels(GridColumnBuilder.getValueLabels(field))
        .aggregate(
            MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Aggregate.class)
                ? MetaAnnotations.find(field, io.mateu.uidl.annotations.Aggregate.class)
                    .value()
                    .name()
                : null)
        .line(
            MetaAnnotations.isPresent(field, Line.class)
                ? MetaAnnotations.find(field, Line.class).value()
                : null)
        .build();
  }

  /**
   * Whether the header of a reflected column sorts. A listing's sort is part of its contract — it
   * arrives in {@code SearchRequest.pageable().sort()} and {@code CrudStore.find} applies it — but
   * no reflected column ever said it was sortable, so there was no header to click and the sort
   * never left the client: on every listing, AutoCrud included. A column sorts when its values have
   * a natural order (text, numbers, booleans, enums, dates and times).
   */
  static boolean isSortable(Class<?> rowClass, GridColumn column) {
    var field =
        getAllFields(rowClass).stream()
            .filter(candidate -> candidate.getName().equals(column.id()))
            .findFirst()
            .orElse(null);
    if (field == null) return false;
    var type = field.getType();
    return type.isPrimitive()
        || CharSequence.class.isAssignableFrom(type)
        || Number.class.isAssignableFrom(type)
        || Boolean.class.equals(type)
        || Character.class.equals(type)
        || type.isEnum()
        || java.time.temporal.Temporal.class.isAssignableFrom(type)
        || java.util.Date.class.isAssignableFrom(type);
  }

  private static String getColumnStyle(AccessibleObject field) {
    if (MetaAnnotations.isPresent(field, Style.class)) {
      return MetaAnnotations.find(field, Style.class).value();
    }
    return "";
  }

  private ListingColumnBuilder() {}

  private static String tooltipPathOf(java.lang.reflect.Field field, String columnWidth) {
    var tooltip =
        io.mateu.core.infra.reflection.MetaAnnotations.find(
            field, io.mateu.uidl.annotations.Tooltip.class);
    if (tooltip != null && !tooltip.value().isBlank()) return tooltip.value();
    return columnWidth != null ? field.getName() : null;
  }

  /**
   * Whether a column of an {@code @InlineEditing} listing may be an editor. A row in place is an
   * EDIT of an existing record, so what an edit never takes from the client is drawn as plain text:
   * {@code @ReadOnly}, {@code @EditableOnlyWhenCreating} (the user typed it on the creation form —
   * the update-row save keeps the stored value, so an editor there accepted typing that was then
   * silently lost), the record's id ({@code @PrimaryKey}, a field named {@code id}, a {@code
   * GeneratedValue}) and the optimistic-lock version.
   */
  static boolean isEditableInARow(java.lang.reflect.Field field) {
    return !MetaAnnotations.isPresent(field, ReadOnly.class)
        && !MetaAnnotations.isPresent(
            field, io.mateu.uidl.annotations.EditableOnlyWhenCreating.class)
        && !MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.GeneratedValue.class)
        && !MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.PrimaryKey.class)
        && !isDeclaredIdOfItsRecord(field)
        && !isVersionField(field);
  }

  /** A field named {@code id} when its class declares no {@code @PrimaryKey}. */
  private static boolean isDeclaredIdOfItsRecord(java.lang.reflect.Field field) {
    if (!"id".equals(field.getName())) {
      return false;
    }
    for (var other :
        io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields(
            field.getDeclaringClass())) {
      if (MetaAnnotations.isPresent(other, io.mateu.uidl.annotations.PrimaryKey.class)) {
        return false;
      }
    }
    return true;
  }

  /**
   * The optimistic-lock version (Mateu's {@code @Version}, or the store's own JPA / Spring Data
   * one) is never edited in place: it answers "did you see the latest?", it is not data.
   */
  private static boolean isVersionField(java.lang.reflect.Field field) {
    if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Version.class)) {
      return true;
    }
    for (var annotation : field.getAnnotations()) {
      var name = annotation.annotationType().getName();
      if (name.equals("jakarta.persistence.Version")
          || name.equals("javax.persistence.Version")
          || name.equals("org.springframework.data.annotation.Version")) {
        return true;
      }
    }
    return false;
  }
}
