package io.mateu.dtos;

import lombok.Builder;

/**
 * Navigation Header of a foldout layout: a top bar to move to the previous/next object of the same
 * type or go to the parent. A null/blank actionId hides the corresponding control.
 */
@Builder
public record FoldoutNavigationDto(
    String title,
    String parentLabel,
    String parentActionId,
    String previousActionId,
    String nextActionId) {}
