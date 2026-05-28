package io.mateu.core.infra.reflection;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static org.apache.commons.beanutils.ConvertUtils.convert;

import io.mateu.uidl.data.Amount;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Array;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

final class ReflectionTypeCoercer {

  @SneakyThrows
  static Object coerce(
      Class type,
      Object data,
      HttpRequest httpRequest,
      Class genericType,
      ReflectionInstanceFactory factory) {
    if (data == null) {
      if (int.class.equals(type)) return 0;
      if (long.class.equals(type)) return 0L;
      if (float.class.equals(type)) return 0f;
      if (double.class.equals(type)) return 0d;
      if (boolean.class.equals(type)) return false;
      return null;
    }
    if (isBasic(type)) {
      if (LocalDate.class.equals(type)) {
        if ("".equals(data)) return null;
        return LocalDate.parse(convert(data));
      } else if (LocalDateTime.class.equals(type)) {
        if ("".equals(data)) return null;
        return LocalDateTime.parse(convert(data));
      } else {
        return convert(data, type);
      }
    } else if (type.isEnum()) {
      if (data instanceof Map<?, ?> map && map.containsKey("value")) {
        return Enum.valueOf(type, (String) map.get("value"));
      }
      return Enum.valueOf(type, (String) data);
    } else if (type.isArray()) {
      List<Object> values = new ArrayList<>();
      ((List<Object>) data)
          .forEach(
              v -> {
                if (v instanceof Map<?, ?> map) {
                  values.add(
                      factory.newInstance(
                          type.componentType(), (Map<String, Object>) map, httpRequest));
                } else if (v instanceof List<?> list) {
                  values.add(list);
                } else {
                  values.add(v);
                }
              });
      var array = Array.newInstance(type.componentType(), values.size());
      for (var i = 0; i < values.size(); i++) {
        var value = values.get(i);
        if (value != null && array.getClass().componentType().isArray()) {
          if (value instanceof List<?> list) {
            var innerArray =
                Array.newInstance(array.getClass().componentType().componentType(), list.size());
            for (var j = 0; j < list.size(); j++) {
              Array.set(innerArray, j, list.get(j));
            }
            value = innerArray;
          }
        }
        ((Object[]) array)[i] = value;
      }
      return array;
    } else if (Class.class.equals(type)) {
      return Class.forName((String) data);
    } else if (Collection.class.isAssignableFrom(type)) {
      var list = new ArrayList();
      ((List<Object>) data)
          .forEach(
              item ->
                  list.add(
                      item instanceof Map<?, ?> map
                          ? factory.newInstance(genericType, (Map<String, Object>) map, httpRequest)
                          : item));
      return list;
    } else if (data instanceof Map map) {
      if (Amount.class.equals(type)) {
        return new Amount(
            (String) map.get("currency"), toDouble(map.get("value")), (String) map.get("locale"));
      }
      return factory.newInstance(type, map, httpRequest);
    } else {
      return data;
    }
  }

  private static Double toDouble(Object value) {
    if (value == null) return null;
    if (value instanceof Double doubleValue) return doubleValue;
    return Double.parseDouble(value.toString());
  }
}
