package io.mateu.core.domain.model.reflection.usecases;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import jakarta.persistence.*;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AllEditableFieldsProvider {

  private final AllFieldsProvider allFieldsProvider;
  private final MethodProvider methodProvider;
  private final GetterProvider getterProvider;

  public AllEditableFieldsProvider(
      AllFieldsProvider allFieldsProvider,
      MethodProvider methodProvider,
      GetterProvider getterProvider) {
    this.allFieldsProvider = allFieldsProvider;
    this.methodProvider = methodProvider;
    this.getterProvider = getterProvider;
  }

  public List<Field> getAllEditableFields(Class modelType) {
    return getAllEditableFilteredFields(modelType, null, null);
  }

  public List<Field> getAllEditableFilteredFields(
      Class modelType, String fieldsFilter, List<Field> editableFields) {
    List<Field> l =
        editableFields != null ? editableFields : getAllEditableFields(modelType, null, true);
    if (!Strings.isNullOrEmpty(fieldsFilter)) {
      List<Field> borrar = new ArrayList<>();
      List<String> ts = Arrays.asList(fieldsFilter.replaceAll(" ", "").split(","));
      for (Field f : l) if (!ts.contains(f.getName())) borrar.add(f);
      l.removeAll(borrar);
    }
    return l;
  }

  public List<Field> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers) {
    return getAllEditableFields(modelType, superType, includeReverseMappers, null);
  }

  public List<Field> getAllEditableFields(
      Class modelType, Class superType, boolean includeReverseMappers, Field field) {
    List<Field> allFields = allFieldsProvider.getAllFields(modelType);

    if (field != null && field.isAnnotationPresent(FieldsFilter.class)) {

      List<String> fns = Arrays.asList(field.getAnnotation(FieldsFilter.class).value().split(","));

      List<Field> borrar = new ArrayList<>();
      for (Field f : allFields) {
        if (!fns.contains(f.getName())) {
          borrar.add(f);
        }
      }
      allFields.removeAll(borrar);
    }

    allFields = filterAccesible(allFields);

    allFields = filterMenuFields(allFields);

    allFields = filterInjected(allFields);

    // todo: ver como resolvemos esto
    boolean isEditingNewRecord = false;

    allFields =
        allFields.stream()
            .filter(
                (f) ->
                    !(f.isAnnotationPresent(Version.class)
                        || f.isAnnotationPresent(Ignored.class)
                        || f.isAnnotationPresent(KPI.class)
                        || f.isAnnotationPresent(NotInEditor.class)
                        || (f.isAnnotationPresent(Id.class)
                            && f.isAnnotationPresent(GeneratedValue.class))
                        || (f.isAnnotationPresent(NotWhenCreating.class) && isEditingNewRecord)
                        || (f.isAnnotationPresent(NotWhenEditing.class) && !isEditingNewRecord)))
            .collect(Collectors.toList());

    if (superType != null && !includeReverseMappers) {

      List<Field> manytoones =
          allFields.stream()
              .filter(f -> f.isAnnotationPresent(ManyToOne.class))
              .collect(Collectors.toList());

      for (Field manytoonefield : manytoones)
        if (superType.equals(manytoonefield.getType())) {

          for (Field parentField : allFieldsProvider.getAllFields(manytoonefield.getType())) {
            // quitamos el campo mappedBy de las columnas, ya que se supone que siempre seremos
            // nosotros
            OneToMany aa;
            if ((aa = parentField.getAnnotation(OneToMany.class)) != null) {

              String mb = parentField.getAnnotation(OneToMany.class).mappedBy();

              if (!Strings.isNullOrEmpty(mb)) {
                Field mbf = null;
                for (Field f : allFields) {
                  if (f.getName().equals(mb)) {
                    mbf = f;
                    break;
                  }
                }
                if (mbf != null) {
                  allFields.remove(mbf);
                  break;
                }
              }
            }
          }
        }
    }

    for (Field f : new ArrayList<>(allFields))
      if (f.isAnnotationPresent(Position.class)) {
        allFields.remove(f);
        allFields.add(f.getAnnotation(Position.class).value(), f);
      }

    return allFields;
  }

  private List<Field> filterMenuFields(List<Field> allFields) {
    List<Field> r = new ArrayList<>();
    for (Field f : allFields) {
      if (!f.isAnnotationPresent(MenuOption.class) && !f.isAnnotationPresent(Submenu.class))
        r.add(f);
    }
    return r;
  }

  private List<Field> filterAccesible(List<Field> allFields) {
    List<Field> r = new ArrayList<>();
    for (Field f : allFields) {
      if (f.getDeclaringClass().isRecord()
          || !Modifier.isPrivate(f.getField().getModifiers())
          || hasGetter(f)) r.add(f);
    }
    return r;
  }

  private List<Field> filterInjected(List<Field> allFields) {
    List<Field> r = new ArrayList<>();
    for (Field f : allFields) {
      if (!f.isAnnotationPresent(Autowired.class)
          && (f.getDeclaringClass().isRecord() || !Modifier.isFinal(f.getModifiers()))) r.add(f);
    }
    return r;
  }

  public boolean hasGetter(Field f) {
    return methodProvider.getMethod(f.getDeclaringClass(), getterProvider.getGetter(f)) != null;
  }
}
