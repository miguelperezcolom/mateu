package io.mateu.dtos;

import lombok.Builder;

/** An action button on the app header, next to the app-context selectors. */
@Builder
public record AppHeaderActionDto(String actionId, String label, String icon) {}
