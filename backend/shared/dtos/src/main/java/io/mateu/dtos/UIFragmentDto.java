package io.mateu.dtos;

import lombok.Builder;
import lombok.With;

/**
 * UI update
 *
 * @param targetComponentId where to place this items
 * @param component New items
 * @param data data
 */
@Builder
@With
public record UIFragmentDto(
    String targetComponentId,
    ComponentDto component,
    Object state,
    Object data,
    UIFragmentActionDto action) {}
