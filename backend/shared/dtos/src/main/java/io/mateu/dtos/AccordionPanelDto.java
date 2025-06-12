package io.mateu.dtos;

import lombok.Builder;

/**
 * A tab
 *
 * @param id The tab targetId
 * @param active If this tab is active
 * @param label The tab label
 */
@Builder
public record AccordionPanelDto(String id, boolean active, String label)
    implements ComponentMetadataDto {}
