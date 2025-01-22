package io.mateu.uidl.data;

import java.util.UUID;

public record Destination(String id, DestinationType type, String description, String value) {

  public Destination(DestinationType type, String description, String value) {
    this(UUID.randomUUID().toString(), type, description, value);
  }
}
