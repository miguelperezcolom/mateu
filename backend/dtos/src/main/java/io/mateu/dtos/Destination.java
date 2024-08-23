package io.mateu.dtos;

/**
 * A link
 *
 * @param type The destination type: action id, url, custom event
 * @param description A link description
 * @param value Data to be used when clicking: the action id, url, event detail
 */
public record Destination(DestinationType type, String description, String value) {}
