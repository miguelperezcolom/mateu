package io.mateu.dtos;

import lombok.Builder;

/**
 * A tab
 *
 * @param id The tab targetId
 */
@Builder
public record ContainerDto(String id) implements ComponentMetadataDto {}
