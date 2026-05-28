package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.SneakyThrows;

public class CrudAdapterHelper {

  public static <T> T toView(HttpRequest httpRequest, Class<T> viewClass) {
    Map<String, Object> map = new HashMap<>(httpRequest.runActionRq().componentState());
    if (httpRequest.runActionRq().parameters() != null) {
      if (httpRequest.runActionRq().parameters().containsKey("initiatorState")) {
        map = (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
      }
    }
    reduce("", map, viewClass);
    return getInstance(map, viewClass, httpRequest);
  }

  @SneakyThrows
  private static <T> T getInstance(
      Map<String, Object> data, Class<T> type, HttpRequest httpRequest) {
    T value = null;
    try {
      value = MateuInstanceFactory.newInstance(type, data, httpRequest);
    } catch (Exception e) {
    }
    if (value == null) {
      var constructor = type.getDeclaredConstructor();
      if (!Modifier.isPublic(constructor.getModifiers())) constructor.setAccessible(true);
      return constructor.newInstance();
    }
    return value;
  }

  public static void reduce(String prefix, Map<String, Object> map, Class<?> type) {
    getAllFields(type).stream()
        .filter(field -> !Modifier.isFinal(field.getModifiers()))
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
    return EntityFieldInspector.getEntityName(item);
  }

  public static String getIdField(Class<?> entityClass) {
    return EntityFieldInspector.getIdField(entityClass);
  }
}
