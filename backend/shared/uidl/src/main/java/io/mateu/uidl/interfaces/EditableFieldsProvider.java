package io.mateu.uidl.interfaces;

import java.lang.reflect.Field;
import java.util.Collection;

/**
 * Implemented by a form to declare, at runtime, exactly which reflective {@link Field}s are
 * editable (overriding the default field discovery). {@link #allEditableFields()} returns that
 * collection.
 */
public interface EditableFieldsProvider {
  Collection<Field> allEditableFields();
}
