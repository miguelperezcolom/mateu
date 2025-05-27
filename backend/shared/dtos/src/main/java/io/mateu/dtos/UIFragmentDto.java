package io.mateu.dtos;

import lombok.Builder;

/**
 * UI update
 *
 * @param targetComponentId where to place this content
 * @param component New content
 * @param data data
 */
@Builder
public record UIFragmentDto(String targetComponentId, ComponentDto component, Object data) {}
