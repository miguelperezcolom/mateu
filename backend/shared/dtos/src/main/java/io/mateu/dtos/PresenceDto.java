package io.mateu.dtos;

import java.util.List;

/**
 * The data of a {@code PresenceChanged} command: the OTHER people who have the record {@code key}
 * open (the recipient is never listed), the oldest first.
 */
public record PresenceDto(String key, List<PresenceEntryDto> entries) {

  public PresenceDto {
    entries = entries != null ? List.copyOf(entries) : List.of();
  }
}
