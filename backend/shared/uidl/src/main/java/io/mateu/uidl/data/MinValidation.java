package io.mateu.uidl.data;

public record MinValidation(int min, String message) implements FieldValidation {
  @Override
  public Object data() {
    return min;
  }
}
