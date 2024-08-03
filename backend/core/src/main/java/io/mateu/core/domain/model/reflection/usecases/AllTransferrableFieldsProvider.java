package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AllTransferrableFieldsProvider {

  private final AllFieldsProvider allFieldsProvider;
  private final MethodProvider methodProvider;
  private final GetterProvider getterProvider;

  public AllTransferrableFieldsProvider(
      AllFieldsProvider allFieldsProvider,
      MethodProvider methodProvider,
      GetterProvider getterProvider) {
    this.allFieldsProvider = allFieldsProvider;
    this.methodProvider = methodProvider;
    this.getterProvider = getterProvider;
  }

  public List<Field> getAllTransferrableFields(Class modelType) {
    List<Field> allFields = allFieldsProvider.getAllFields(modelType);

    allFields = filterAccesible(allFields);

    allFields = filterInjected(allFields);

    return allFields;
  }

  private List<Field> filterAccesible(List<Field> allFields) {
    List<Field> r = new ArrayList<>();
    for (Field f : allFields) {
      if (hasGetter(f)) r.add(f);
    }
    return r;
  }

  private List<Field> filterInjected(List<Field> allFields) {
    List<Field> r = new ArrayList<>();
    for (Field f : allFields) {
      if (!f.isAnnotationPresent(Autowired.class) && !Modifier.isFinal(f.getModifiers())) r.add(f);
    }
    return r;
  }

  public boolean hasGetter(Field f) {
    return methodProvider.getMethod(f.getDeclaringClass(), getterProvider.getGetter(f)) != null;
  }
}
