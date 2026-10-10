package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;

/**
 * A {@code List}/{@code Set} (or array) of enum constants declared with a multi-choice stereotype
 * ({@code @Stereotype(multiSelect | checkbox | listBox | combobox | choice)}): ONE form field whose
 * options are the enum constants and whose value is the list of the chosen ones — e.g. a guest's
 * room preferences. Without this a {@code List<Enum>} became a grid (a crud of enum values) and a
 * {@code Set<Enum>} a nested form with nothing in it, so the field silently disappeared. Only an
 * explicit stereotype opts in: an undeclared collection keeps its previous rendering.
 */
public final class ChoiceCollections {

  static final Set<FieldStereotype> MULTI_CHOICE =
      EnumSet.of(
          FieldStereotype.multiSelect,
          FieldStereotype.checkbox,
          FieldStereotype.listBox,
          FieldStereotype.combobox,
          FieldStereotype.choice);

  private ChoiceCollections() {}

  public static boolean isChoiceCollection(Field field) {
    if (elementEnum(field) == null) return false;
    var stereotype = MetaAnnotations.find(field, Stereotype.class);
    return stereotype != null && MULTI_CHOICE.contains(stereotype.value());
  }

  /** The enum type of the elements, or null when the field is not a collection of enums. */
  public static Class<?> elementEnum(Field field) {
    var type = field.getType();
    if (type.isArray()) {
      return type.getComponentType().isEnum() ? type.getComponentType() : null;
    }
    if (!Collection.class.isAssignableFrom(type)) return null;
    if (field.getGenericType() instanceof ParameterizedType parameterized
        && parameterized.getActualTypeArguments().length == 1
        && parameterized.getActualTypeArguments()[0] instanceof Class<?> element
        && element.isEnum()) {
      return element;
    }
    return null;
  }
}
