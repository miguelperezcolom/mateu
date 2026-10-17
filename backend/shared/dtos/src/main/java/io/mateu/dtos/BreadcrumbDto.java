package io.mateu.dtos;

/**
 * One crumb of a {@link BreadcrumbsDto} or of a page's breadcrumbs ({@code PageDto.breadcrumbs}) —
 * an item, not a component: it travels inside those and has no {@code type} of its own.
 */
public record BreadcrumbDto(String text, String link) {}
