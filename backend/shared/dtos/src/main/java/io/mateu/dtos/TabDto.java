package io.mateu.dtos;

/**
 * A tab
 *
 * @param id The tab targetId
 * @param active If this tab is active
 * @param caption The tab label
 */
public record TabDto(String id, boolean active, String caption) {}
