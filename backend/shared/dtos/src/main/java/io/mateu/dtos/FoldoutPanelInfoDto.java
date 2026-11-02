package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

/**
 * Header info for one foldout panel; its content travels as a slotted component child. {@code
 * width} is an optional CSS length for the expanded panel (null = renderer default). {@code
 * autoOpen} (true or absent) = the renderer opens the panel while it fits, ignoring {@code open}.
 */
@Builder
public record FoldoutPanelInfoDto(
    String title,
    String subtitle,
    String icon,
    boolean open,
    String width,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean autoOpen) {}
