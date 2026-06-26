package io.mateu.dtos;

import lombok.Builder;

/**
 * A tab
 *
 * @param id The tab targetId
 * @param active If this tab is active
 * @param label The tab label
 * @param shortcut Keyboard shortcut that selects this tab (e.g. "alt+1"); null if none
 */
@Builder
public record TabDto(String id, boolean active, String label, String shortcut)
    implements ComponentMetadataDto {}
