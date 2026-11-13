package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.AllFieldsProvider;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.PrimaryKey;
import java.lang.reflect.Field;

/**
 * A crud entity's TECHNICAL id: its declared id ({@code @PrimaryKey}, else a field named {@code
 * id}) when the entity does not let the user choose it — no {@code @EditableOnlyWhenCreating} (the
 * user types it on the creation form) and no {@code @GeneratedValue} (the server fills it into the
 * form). The store assigns it, so a creation form draws no input for it and a create never takes it
 * from the client: typing an existing id overwrote that record (GA Explorer pass, F6). The listing
 * already leaves it out (W-V-TABLE-ID).
 */
public final class TechnicalId {

  private TechnicalId() {}

  private static final ClassValue<java.util.Optional<String>> BY_CLASS =
      new ClassValue<>() {
        @Override
        protected java.util.Optional<String> computeValue(Class<?> type) {
          return java.util.Optional.ofNullable(compute(type));
        }
      };

  /** The technical id field of {@code entityClass}, or null when it has none. */
  public static String of(Class<?> entityClass) {
    return entityClass == null ? null : BY_CLASS.get(entityClass).orElse(null);
  }

  private static String compute(Class<?> entityClass) {
    Field id = null;
    for (var field : AllFieldsProvider.getAllFields(entityClass)) {
      if (MetaAnnotations.isPresent(field, PrimaryKey.class)) {
        id = field;
        break;
      }
      if (id == null && "id".equals(field.getName())) {
        id = field;
      }
    }
    return id != null && isTechnical(id) ? id.getName() : null;
  }

  /** Whether the user does not choose this id field (see the class comment). */
  public static boolean isTechnical(Field field) {
    return !MetaAnnotations.isPresent(field, EditableOnlyWhenCreating.class)
        && !MetaAnnotations.isPresent(field, GeneratedValue.class);
  }
}
