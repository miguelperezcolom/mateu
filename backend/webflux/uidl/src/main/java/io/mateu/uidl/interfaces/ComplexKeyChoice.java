package io.mateu.uidl.interfaces;

import java.util.Collections;
import java.util.List;

public record ComplexKeyChoice(Object value, List<ComplexKeyOption> options) {

  public ComplexKeyChoice {
    options = Collections.unmodifiableList(options);
  }

  @Override
  public List<ComplexKeyOption> options() {
    return Collections.unmodifiableList(options);
  }
}
