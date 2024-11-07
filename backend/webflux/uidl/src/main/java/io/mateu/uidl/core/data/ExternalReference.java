package io.mateu.uidl.core.data;

public record ExternalReference(Object value, String key) {

  @Override
  public String toString() {
    return key;
  }
}
