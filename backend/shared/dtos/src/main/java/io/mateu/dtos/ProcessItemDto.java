package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record ProcessItemDto(
    String id,
    String name,
    List<String> systems,
    int ok,
    int warnings,
    int errors,
    String status,
    String actionLabel,
    String actionId) {

  public ProcessItemDto {
    systems = Collections.unmodifiableList(systems != null ? systems : Collections.emptyList());
  }

  @Override
  public List<String> systems() {
    return Collections.unmodifiableList(systems);
  }
}
