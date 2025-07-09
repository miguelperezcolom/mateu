package io.mateu.uidl.data;

public record MaxValidation(int min, String message) implements FieldValidation {
  @Override
  public Object data() {
    return min;
  }
}
