package io.mateu.dtos;

/**
 * A link
 *
 * @param id The destination id. Used later to link to the real action on the backend
 * @param type The destination type: action targetId, url, custom event
 * @param description A link description
 */
public record DestinationDto(
    String id, DestinationTypeDto type, String description, String value) {}
