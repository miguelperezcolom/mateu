package io.mateu.core.domain;

import jakarta.inject.Named;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Named
public class BasicTypeChecker {

  private final List<Class> basicTypes = new ArrayList<>();

  public BasicTypeChecker() {
    basicTypes.add(String.class);
    basicTypes.add(Integer.class);
    basicTypes.add(Long.class);
    basicTypes.add(Float.class);
    basicTypes.add(Double.class);
    basicTypes.add(BigDecimal.class);
    basicTypes.add(Boolean.class);
    basicTypes.add(LocalDate.class);
    basicTypes.add(LocalDateTime.class);
    basicTypes.add(LocalTime.class);
    basicTypes.add(int.class);
    basicTypes.add(long.class);
    basicTypes.add(float.class);
    basicTypes.add(double.class);
    basicTypes.add(boolean.class);
  }

  public boolean isBasic(Class c) {
    return basicTypes.contains(c);
  }

  public boolean isBasic(Object o) {
    if (o == null) {
      return false;
    }
    return isBasic(o.getClass());
  }
}
