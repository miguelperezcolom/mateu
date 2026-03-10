package io.mateu.uidl.interfaces;

import java.lang.reflect.Field;
import java.util.Collection;

public interface EditableFieldsProvider {
  Collection<Field> allEditableFields();
}
