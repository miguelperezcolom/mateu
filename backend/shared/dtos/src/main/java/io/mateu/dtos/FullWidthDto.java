package io.mateu.dtos;

import lombok.Builder;

/**
 * A tab
 *
 * @param id The tab targetId
 */
@Builder
public record FullWidthDto(String id) implements ComponentMetadataDto {}
