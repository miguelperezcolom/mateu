package io.mateu.dtos;

/**
 * UI update
 *
 * @param targetComponentId where to place this content
 * @param component New content
 * @param data data
 */
public record UIFragmentDto(String targetComponentId, ComponentDto component, Object data) {}
