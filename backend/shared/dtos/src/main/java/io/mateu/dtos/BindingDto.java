package io.mateu.dtos;

import lombok.Builder;

/**
 * A button
 *
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Builder
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record BindingDto(BindingSourceDto source, String propertyId) {}
