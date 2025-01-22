package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.annotations.LabelFieldForLists;
import jakarta.persistence.Id;
import java.lang.reflect.Method;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class NameFieldProvider {

  private final MethodProvider methodProvider;
  private final AllFieldsProvider allFieldsProvider;

  public NameFieldProvider(MethodProvider methodProvider, AllFieldsProvider allFieldsProvider) {
    this.methodProvider = methodProvider;
    this.allFieldsProvider = allFieldsProvider;
  }

  @Cacheable(value = "name-field-in-class")
  public Field getNameField(Class entityClass, boolean toStringPreferred) {
    Field fName = null;
    Method toStringMethod = methodProvider.getMethod(entityClass, "toString");
    boolean toStringIsOverriden =
        toStringMethod != null && toStringMethod.getDeclaringClass().equals(entityClass);
    if (!toStringPreferred || !toStringIsOverriden) {
      boolean hayName = false;
      for (Field ff : allFieldsProvider.getAllFields(entityClass))
        if (ff.isAnnotationPresent(LabelFieldForLists.class)) {
          fName = ff;
          hayName = true;
        }
      if (!hayName) {
        for (Field ff : allFieldsProvider.getAllFields(entityClass))
          if ("name".equalsIgnoreCase(ff.getName()) || "nombre".equalsIgnoreCase(ff.getName())) {
            fName = ff;
            hayName = true;
          }
      }
      if (!hayName) {
        for (Field ff : allFieldsProvider.getAllFields(entityClass))
          if ("value".equalsIgnoreCase(ff.getName())
              || "title".equalsIgnoreCase(ff.getName())
              || "titulo".equalsIgnoreCase(ff.getName())
              || "description".equalsIgnoreCase(ff.getName())
              || "descripcion".equalsIgnoreCase(ff.getName())) {
            fName = ff;
            hayName = true;
          }
      }
      if (!hayName) {
        for (Field ff : allFieldsProvider.getAllFields(entityClass))
          if ("description".equalsIgnoreCase(ff.getName())
              || "descripcion".equalsIgnoreCase(ff.getName())) {
            fName = ff;
            hayName = true;
          }
      }
      if (!hayName) {
        for (Field ff : allFieldsProvider.getAllFields(entityClass))
          if (ff.isAnnotationPresent(Id.class)) {
            fName = ff;
          }
      }
    }
    return fName;
  }
}
