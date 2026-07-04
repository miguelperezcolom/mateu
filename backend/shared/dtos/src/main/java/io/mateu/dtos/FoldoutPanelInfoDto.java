package io.mateu.dtos;

import lombok.Builder;

/** Header info for one foldout panel; its content travels as a slotted component child */
@Builder
public record FoldoutPanelInfoDto(String title, String subtitle, String icon, boolean open) {}
