package io.mateu.core.domain.reflection.samples;

public class WithObjectConstructorParameters {

  private final Parameter value;

  public WithObjectConstructorParameters(Parameter value) {
    this.value = value;
  }

  @Override
  public String toString() {
    return value.toString();
  }
}
