package io.mateu.uidl.data;

public record JsValidation(String js, String message) implements FieldValidation {
  @Override
  public Object data() {
    return js;
  }
}
