package io.mateu.core.domain;

import java.io.File;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.Date;
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
          BigInteger.class,
          Boolean.class,
          LocalDate.class,
          LocalDateTime.class,
          LocalTime.class,
          // the date-times FieldTypeMapper maps to dateTime and the file it maps to file: before,
          // they were treated as nested forms and the whole page failed to build
          Date.class,
          java.sql.Date.class,
          ZonedDateTime.class,
          File.class,
          // an Optional<X> field is a field of type X (OptionalFields), never a nested form
          java.util.Optional.class,
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

  public static boolean isBasicArray(Class c) {
    return c.isArray() && isBasic(c.getComponentType());
  }
}
