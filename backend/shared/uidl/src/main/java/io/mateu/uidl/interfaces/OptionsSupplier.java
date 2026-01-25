package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Option;
import java.util.List;

public interface OptionsSupplier {

  default boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
    return true;
  }
  ;

  List<Option> options(String fieldName, HttpRequest httpRequest);
}
