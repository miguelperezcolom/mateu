package io.mateu.core.domain.reflection.samples;

public class Parameter {
  private String name;

  public Parameter(String name) {
    this.name = name;
  }

  @Override
  public String toString() {
    return name;
  }
}
