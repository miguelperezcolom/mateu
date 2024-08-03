package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ObjectCopier {

  private final FieldByNameProvider fieldByNameProvider;
  private final AllFieldsProvider allFieldsProvider;
  private final AllTransferrableFieldsProvider allTransferrableFieldsProvider;
  private final ValueProvider valueProvider;
  private final ValueWriter valueWriter;

  public ObjectCopier(
      FieldByNameProvider fieldByNameProvider,
      AllFieldsProvider allFieldsProvider,
      AllTransferrableFieldsProvider allTransferrableFieldsProvider,
      ValueProvider valueProvider,
      ValueWriter valueWriter) {
    this.fieldByNameProvider = fieldByNameProvider;
    this.allFieldsProvider = allFieldsProvider;
    this.allTransferrableFieldsProvider = allTransferrableFieldsProvider;
    this.valueProvider = valueProvider;
    this.valueWriter = valueWriter;
  }

  public void copy(Object from, Object to) {
    if (from != null && to != null) {
      if (from.getClass().equals(to.getClass())) {
        for (Field f : allTransferrableFieldsProvider.getAllTransferrableFields(to.getClass())) {
          try {
            valueWriter.setValue(f, to, valueProvider.getValue(f, from));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
        for (Field f : getAllInjectedFields(to.getClass())) {
          try {
            copy(valueProvider.getValue(f, from), valueProvider.getValue(f, to));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      } else {
        for (Field f2 : allTransferrableFieldsProvider.getAllTransferrableFields(to.getClass())) {
          try {
            Field f1 = fieldByNameProvider.getFieldByName(from.getClass(), f2.getName());
            if (f1 != null && f1.getType().equals(f2.getType()))
              valueWriter.setValue(f2, to, valueProvider.getValue(f1, from));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      }
    }
  }

  private List<Field> getAllInjectedFields(Class<?> type) {
    List<Field> r = new ArrayList<>();
    var allFields = allFieldsProvider.getAllFields(type);
    for (Field f : allFields) {
      if (f.isAnnotationPresent(Autowired.class) || Modifier.isFinal(f.getModifiers())) r.add(f);
    }
    return r;
  }
}
