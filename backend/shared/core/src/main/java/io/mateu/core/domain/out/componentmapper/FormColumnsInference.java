package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.HolderFieldChecker;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Zones;
import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

/**
 * The form's column count when the developer did not declare one: ONE column for a form with up to
 * {@value #MAX_SINGLE_COLUMN_FIELDS} visible fields, TWO from 7 on. A short form reads top to
 * bottom; two columns only pay off once the form is long enough to scroll.
 *
 * <p>Decided per CLASS (deterministic, cached, never dependent on the caller): the count is over
 * the fields that render as form fields — the class's editable fields minus what never renders in
 * the form body whoever looks ({@code @Hidden} without a condition, {@code @KPI},
 * {@code @BadgeInHeader}, {@code @Timestamp}, {@code @AppContext}, {@code @Aside}, {@code @Menu},
 * {@code @Composition}, {@code @Version}, {@code Status}, wire DTOs, and component holders — {@code
 * Callable}/{@code Supplier}/{@code Runnable}/{@code Component} fields carry their own content, not
 * a form field). Permission- or mode-dependent fields ({@code @EyesOnly}, {@code @Audience}, a
 * conditional {@code @Hidden("…")}, {@code @HiddenInEditor}…) COUNT, so one class gets one layout.
 * A grid/list field counts as one field (it takes a row anyway). An {@code @Inline} nested form
 * counts its own visible fields, since they render inline in this form.
 *
 * <p>The REFERENCE for the .NET ({@code FormColumnsInference.cs}) and Python ({@code
 * form_columns_inference.py}) ports: same threshold, same counting, so the wire stays identical.
 * Declarations always win and never reach this class: {@code @FormLayout(columns = N)},
 * {@code @Section(columns = N)}, and {@code @Zones} (a zoned form keeps the classic 2).
 */
public final class FormColumnsInference {

  /** Up to this many visible fields a form is laid out in one column. */
  public static final int MAX_SINGLE_COLUMN_FIELDS = 6;

  private static final ClassValue<Integer> COLUMNS =
      new ClassValue<>() {
        @Override
        protected Integer computeValue(Class<?> type) {
          return visibleFieldCount(type, new HashSet<>()) <= MAX_SINGLE_COLUMN_FIELDS ? 1 : 2;
        }
      };

  private FormColumnsInference() {}

  /**
   * The column count of a form of this class: the declared {@code @FormLayout(columns)} when ≥ 1, 2
   * for a zoned form, else the inferred one.
   */
  static int formColumns(Class<?> type) {
    var declared = declaredColumns(type);
    if (declared >= 1) {
      return declared;
    }
    if (type == null || MetaAnnotations.isPresent(type, Zones.class)) {
      return 2;
    }
    return COLUMNS.get(type);
  }

  /** The class's {@code @FormLayout(columns)} when declared (≥ 1), else 0. */
  static int declaredColumns(Class<?> type) {
    if (type == null) {
      return 0;
    }
    var formLayout = MetaAnnotations.find(type, FormLayout.class);
    return formLayout != null && formLayout.columns() >= 1 ? formLayout.columns() : 0;
  }

  /** Whether the class's column count is inferred (nothing declared on the class). */
  static boolean inferred(Class<?> type) {
    return type != null
        && declaredColumns(type) == 0
        && !MetaAnnotations.isPresent(type, Zones.class);
  }

  static int visibleFieldCount(Class<?> type) {
    return visibleFieldCount(type, new HashSet<>());
  }

  private static int visibleFieldCount(Class<?> type, Set<Class<?>> visiting) {
    if (type == null || !visiting.add(type)) {
      return 0;
    }
    int count = 0;
    for (Field field : getAllEditableFields(type)) {
      if (!FormFieldFilter.rendersInAnyForm(field) || HolderFieldChecker.isNonDataHolder(field)) {
        continue;
      }
      if (MetaAnnotations.isPresent(field, Inline.class)
          && !EmbeddedOrchestratorFieldBuilder.isOrchestrator(field.getType())
          && FormDetector.isForm(field.getType())) {
        count += visibleFieldCount(field.getType(), visiting);
      } else {
        count++;
      }
    }
    visiting.remove(type);
    return count;
  }
}
