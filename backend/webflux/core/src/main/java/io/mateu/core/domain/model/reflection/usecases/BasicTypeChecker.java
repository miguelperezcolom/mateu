package io.mateu.core.domain.model.reflection.usecases;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BasicTypeChecker {

  private final List<Class> basicTypes = new ArrayList<>();

  public BasicTypeChecker() {
    basicTypes.add(String.class);
    basicTypes.add(Integer.class);
    basicTypes.add(Long.class);
    basicTypes.add(Float.class);
    basicTypes.add(Double.class);
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
    return isBasic(o.getClass());
  }
}
