package io.mateu.uidl.data;

public record Option(Object value, String label, String description) {

  public Option(Object value) {
    this(value, "" + value, "");
  }

  public Option(Object value, String label) {
    this(value, label, "");
  }
}
