package io.mateu.dtos;

import lombok.Builder;

/**
 * UI update
 *
 * @param targetComponentId where to place this items
 * @param component New items
 * @param data data
 */
@Builder
public record UIFragmentDto(
    String targetComponentId,
    ComponentDto component,
    Object state,
    Object data,
    UIFragmentActionDto action) {}
