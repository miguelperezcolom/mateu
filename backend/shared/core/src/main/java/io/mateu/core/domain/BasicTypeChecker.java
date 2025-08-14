package io.mateu.core.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class BasicTypeChecker {

  private static final List<Class> basicTypes =
      List.of(
          String.class,
          Integer.class,
          Long.class,
          Float.class,
          Double.class,
          BigDecimal.class,
          Boolean.class,
          LocalDate.class,
          LocalDateTime.class,
          LocalTime.class,
          int.class,
          long.class,
          float.class,
          double.class,
          boolean.class);

  public static boolean isBasic(Class c) {
    if (c == null) {
      return false;
    }
    return basicTypes.contains(c);
  }

  public static boolean isBasic(Object o) {
    if (o == null) {
      return false;
    }
    return isBasic(o.getClass());
  }
}
