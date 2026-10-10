package io.mateu.dtos;

/**
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public enum JourneyStatusDto {
  Running,
  Waiting,
  Pending,
  Finished
}
