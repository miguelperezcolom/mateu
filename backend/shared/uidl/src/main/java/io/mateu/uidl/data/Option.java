package io.mateu.uidl.data;

public record Option(Object value, String label, String description, String image) {

  public Option(Object value) {
    this(value, "" + value, "", "");
  }

  public Option(Object value, String label) {
    this(value, label, "", "");
  }

  public Option(Object value, String label, String description) {
    this(value, label, description, "");
  }
}
