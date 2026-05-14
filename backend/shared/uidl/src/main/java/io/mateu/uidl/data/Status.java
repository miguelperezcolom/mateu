package io.mateu.uidl.data;

public record Status(StatusType type, String message, String value) {
  public Status(StatusType type, String message) {
    this(type, message, message);
  }
}
