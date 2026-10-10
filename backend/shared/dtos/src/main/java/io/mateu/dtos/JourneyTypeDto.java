package io.mateu.dtos;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public class JourneyTypeDto {

  private String id;

  private String name;

  private String description;
}
