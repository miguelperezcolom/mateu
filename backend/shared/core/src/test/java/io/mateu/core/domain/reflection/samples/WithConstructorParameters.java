package io.mateu.core.domain.reflection.samples;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WithConstructorParameters {

  private final String name;

  private final LocalDate birthDate;

  private final LocalDateTime lastAccess;

  public WithConstructorParameters(String name, LocalDate birthDate, LocalDateTime lastAccess) {
    this.name = name;
    this.birthDate = birthDate;
    this.lastAccess = lastAccess;
  }

  @Override
  public String toString() {
    return name + " " + birthDate + " " + lastAccess;
  }
}
