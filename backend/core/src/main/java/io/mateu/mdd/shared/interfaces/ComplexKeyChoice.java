package io.mateu.mdd.shared.interfaces;

import java.util.List;

public abstract class ComplexKeyChoice<T> {

  private T value;

  public T getValue() {
    return value;
  }

  public ComplexKeyChoice setValue(T value) {
    this.value = value;
    return this;
  }

  public abstract List<ComplexKeyOption> getOptions();
}
