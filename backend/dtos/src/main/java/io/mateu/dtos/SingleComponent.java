package io.mateu.dtos;

/**
 * A single component content
 *
 * @param componentId The component id
 */
public record SingleComponent(String componentId)
    implements Content {}
