package io.mateu.dtos;

import lombok.Builder;

/**
 * Header info for one foldout panel; its content travels as a slotted component child. {@code
 * width} is an optional CSS length for the expanded panel (null = renderer default).
 */
@Builder
public record FoldoutPanelInfoDto(
    String title, String subtitle, String icon, boolean open, String width) {}
