package io.mateu.core.infra.reflection.read;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

public class TypeCoercionHelper {

  public static Object getActualValue(
      Class targetType, Object value, InstanceFactory instanceFactory, HttpRequest httpRequest)
      throws Exception {
    if (value == null) {
      if (int.class.equals(targetType)) return 0;
      if (long.class.equals(targetType)) return 0L;
      if (float.class.equals(targetType)) return 0f;
      if (double.class.equals(targetType)) return 0.0;
      if (boolean.class.equals(targetType)) return false;
      return null;
    }
    if (targetType.equals(value.getClass())) {
      return value;
    }
    // numeric coercion without string round-trip — the JS client integerizes whole doubles
    // (343.0 travels as 343), and parseInt/parseLong choke on decimal renderings like "343.0"
    if (value instanceof Number number) {
      if (int.class.equals(targetType) || Integer.class.equals(targetType))
        return number.intValue();
      if (long.class.equals(targetType) || Long.class.equals(targetType)) return number.longValue();
      if (double.class.equals(targetType) || Double.class.equals(targetType))
        return number.doubleValue();
      if (float.class.equals(targetType) || Float.class.equals(targetType))
        return number.floatValue();
      if (BigDecimal.class.equals(targetType)) return new BigDecimal(number.toString());
    }
    if (int.class.equals(targetType)) return Integer.parseInt("" + value);
    if (long.class.equals(targetType)) return Long.parseLong("" + value);
    if (double.class.equals(targetType)) return Double.parseDouble("" + value);
    if (float.class.equals(targetType)) return Float.parseFloat("" + value);
    if (boolean.class.equals(targetType)) return Boolean.parseBoolean("" + value);
    if (Integer.class.equals(targetType)) return Integer.parseInt("" + value);
    if (Long.class.equals(targetType)) return Long.parseLong("" + value);
    if (Double.class.equals(targetType)) return Double.parseDouble("" + value);
    if (Float.class.equals(targetType)) return Float.parseFloat("" + value);
    if (BigDecimal.class.equals(targetType)) return new BigDecimal("" + value);
    if (Boolean.class.equals(targetType)) return Boolean.parseBoolean("" + value);
    if (LocalDate.class.equals(targetType)) return LocalDate.parse("" + value);
    if (LocalDateTime.class.equals(targetType)) return LocalDateTime.parse("" + value);
    if (LocalTime.class.equals(targetType)) return LocalTime.parse("" + value);
    if (targetType.isEnum()) return Enum.valueOf(targetType, "" + value);
    if (Class.class.equals(targetType)) return forName("" + value);
    if (Map.class.isAssignableFrom(value.getClass())) {
      return instanceFactory
          .createInstance(targetType.getName(), (Map<String, Object>) value, httpRequest)
          .toFuture()
          .get();
    }
    return value;
  }
}
