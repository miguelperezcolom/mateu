package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CrudAdapterHelper {

  public static <T> T toView(HttpRequest httpRequest, Class<T> viewClass) {
    var map = new HashMap<>(httpRequest.runActionRq().componentState());
    reduce("", map, viewClass);
    return MateuBeanProvider.getBean(MateuInstanceFactory.class)
        .newInstance(viewClass, map, httpRequest);
  }

  public static <T> T toEntity(HttpRequest httpRequest, Class<?> viewClass, Class<T> entityClass) {
    var map = new HashMap<>(httpRequest.runActionRq().componentState());
    reduce("", map, viewClass);
    return MateuBeanProvider.getBean(MateuInstanceFactory.class)
        .newInstance(entityClass, map, httpRequest);
  }

  public static void reduce(String prefix, HashMap<String, Object> map, Class<?> type) {
    getAllFields(type).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !List.class.isAssignableFrom(field.getType()))
        .forEach(
            field -> {
              reduce(prefix + field.getName() + "-", map, field.getType());
            });
    if (!"".equals(prefix)) {
      map.put(
          prefix.substring(0, prefix.length() - 1),
          map.entrySet().stream()
              .filter(entry -> entry.getKey().startsWith(prefix))
              .filter(entry -> entry.getValue() != null)
              .collect(
                  Collectors.toMap(
                      entry -> entry.getKey().substring(prefix.length()), Map.Entry::getValue)));
    }
  }

  public static String getEntityName(Object item) {
    if (item == null) {
      return "No item found";
    }
    Object name = null;
    try {
      name = getValue(getFieldByName(item.getClass(), "name"), item);
      if (name != null) {
        return "" + name;
      }
    } catch (Exception ignored) {
    }
    try {
      name = getValue(getFieldByName(item.getClass(), getIdField(item.getClass())), item);
      if (name != null) {
        return "" + name;
      }
    } catch (Exception ignored) {
    }
    return item.toString();
  }

  public static String getIdField(Class<?> entityClass) {
    boolean hasIdField = false;
    String firstField = null;
    for (Field field : getAllFields(entityClass)) {
      if (field.isAnnotationPresent(PrimaryKey.class)) {
        return field.getName();
      }
      hasIdField |= "id".equals(field.getName());
      if (firstField == null) {
        firstField = field.getName();
      }
    }
    return hasIdField ? "id" : firstField;
  }
}
