package io.mateu.dtos;

/**
 * One person who has a record open: the name to show, whether they are editing it (their page holds
 * unsaved changes) and since when (ISO-8601 instant).
 */
public record PresenceEntryDto(String name, boolean editing, String since) {}
