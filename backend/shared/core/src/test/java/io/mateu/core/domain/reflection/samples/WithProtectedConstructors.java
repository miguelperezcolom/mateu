package io.mateu.core.domain.reflection.samples;

public class WithProtectedConstructors {

  String name;

  int age;

  protected WithProtectedConstructors(String name) {
    this.name = name;
    this.age = 17;
  }

  @Override
  public String toString() {
    return name;
  }
}
