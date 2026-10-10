package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record ItemsDto(List<ValueDto> content, long totalElements) {

  public ItemsDto {
    content = Collections.unmodifiableList(content);
  }

  @Override
  public List<ValueDto> content() {
    return Collections.unmodifiableList(content);
  }
}
