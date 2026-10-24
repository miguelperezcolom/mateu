package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.LabelsAsideMode;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * Infers where a form's field labels sit (the {@code labelsAside} wire flag), following the dense
 * backoffice data-entry idiom: labels-aside pays off (one compact row per field, a scannable label
 * column) only when the form is single-column AND dense AND short-labelled AND made of single-line
 * widgets; anything else keeps labels on top (also the Redwood form convention). The explicit
 * {@code @FormLayout(labelsAside = ASIDE|TOP)} always wins over this inference.
 */
final class LabelsAsideInference {

  /** Below this field count a form is not dense enough for labels-aside to pay off. */
  private static final int MIN_FIELDS = 6;

  /** Longest label that fits the aside label column without truncation. */
  private static final int MAX_LABEL_CHARS = 20;

  private LabelsAsideInference() {}

  /**
   * The form's labels mode: the explicit {@code @FormLayout(labelsAside=...)} on the view class
   * wins; with {@code AUTO} the mode is inferred from the form's shape.
   */
  static boolean labelsAside(
      List<Field> fields, int maxColumns, Object instance, HttpRequest httpRequest) {
    var instanceType =
        instance == null
            ? null
            : instance instanceof Class ? (Class<?>) instance : instance.getClass();
    var annotation =
        instanceType == null
            ? null
            : MetaAnnotations.find(instanceType, io.mateu.uidl.annotations.FormLayout.class);
    if (annotation != null && annotation.labelsAside() != LabelsAsideMode.AUTO) {
      return annotation.labelsAside() == LabelsAsideMode.ASIDE;
    }
    return infer(fields, maxColumns, instanceType, instance, httpRequest);
  }

  private static boolean infer(
      List<Field> fields,
      int maxColumns,
      Class<?> instanceType,
      Object instance,
      HttpRequest httpRequest) {
    if (maxColumns != 1
        || fields.size() < MIN_FIELDS
        || !singleColumnDeclared(instanceType, fields)) {
      return false;
    }
    for (Field field : fields) {
      if (FieldMetadataExtractor.getLabel(field, instance, httpRequest).length()
          > MAX_LABEL_CHARS) {
        return false;
      }
      if (isWideWidget(field)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Labels-aside is the idiom of a form the developer DECLARED single-column
   * ({@code @FormLayout(columns = 1)}, {@code @Section(columns = 1)}): a small form that is
   * single-column only because Mateu inferred it ({@link FormColumnsInference} — up to 6 visible
   * fields) keeps its labels on top, or every 6-field form would flip to labels aside. When the
   * class's count is not inferred, a single column came from a declaration (the class's, or a
   * section's on a class that would otherwise get 2).
   */
  private static boolean singleColumnDeclared(Class<?> instanceType, List<Field> fields) {
    if (instanceType == null
        || !FormColumnsInference.inferred(instanceType)
        || FormColumnsInference.formColumns(instanceType) != 1) {
      return true;
    }
    return fields.stream()
        .map(field -> MetaAnnotations.find(field, io.mateu.uidl.annotations.Section.class))
        .anyMatch(section -> section != null && section.columns() == 1);
  }

  /** Widgets that break the aside row: tall/wide content that needs the field's full width. */
  private static boolean isWideWidget(Field field) {
    var stereotype = MetaAnnotations.find(field, io.mateu.uidl.annotations.Stereotype.class);
    if (stereotype != null
        && (stereotype.value() == FieldStereotype.textarea
            || stereotype.value() == FieldStereotype.richText)) {
      return true;
    }
    var type = field.getType();
    if (Collection.class.isAssignableFrom(type)
        || Map.class.isAssignableFrom(type)
        || Callable.class.isAssignableFrom(type)) {
      return true;
    }
    return !isBasic(type) && !type.isEnum();
  }
}
