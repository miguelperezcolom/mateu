package io.mateu.core.domain.model.util.exceptions;

import java.util.List;
import java.util.stream.Collectors;

public class MoreThanOneImplementationFound extends Exception {

  private final String msg;

  public <T> MoreThanOneImplementationFound(Class<T> anInterface, List<T> impls) {
    msg =
        "More than 1 implementation found for "
            + anInterface.getName()
            + " ("
            + impls.stream()
                .map(i -> i.getClass())
                .map(Class::getSimpleName)
                .collect(Collectors.joining(","))
            + ")";
  }
}
