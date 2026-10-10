package io.mateu.dtos;

/**
 * A view
 *
 * @param header Header items
 * @param left Left aside items
 * @param main Main items
 * @param right Right aside items
 * @param footer Footer items
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record ViewDto(
    ViewPartDto header,
    ViewPartDto left,
    ViewPartDto main,
    ViewPartDto right,
    ViewPartDto footer) {}
