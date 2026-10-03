package io.mateu.dtos;

import lombok.Builder;

/**
 * A tab
 *
 * @param id The tab targetId
 * @param active If this tab is active
 * @param label The tab label
 * @param shortcut Keyboard shortcut that selects this tab (e.g. "alt+1"); null if none
 * @param routeKey the URL segment that opens this tab ({@code @Tab(key)}); selecting the tab pushes
 *     it as a history entry. Null when the tab has no URL of its own
 * @param badge a count drawn on the tab (the rows of its EAGER {@code @Subresource} listings); null
 *     for none
 */
@Builder
public record TabDto(
    String id, boolean active, String label, String shortcut, String routeKey, String badge)
    implements ComponentMetadataDto {}
