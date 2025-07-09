package io.mateu.uidl.data;

public record PatternValidation(String pattern, String message) implements FieldValidation {
  @Override
  public Object data() {
    return pattern;
  }
}
