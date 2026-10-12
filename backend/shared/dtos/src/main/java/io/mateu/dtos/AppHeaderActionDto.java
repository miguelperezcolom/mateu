package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** An action button on the app header, next to the app-context selectors. */
@Builder
public record AppHeaderActionDto(
    String actionId,
    String label,
    String icon,
    List<AppHeaderActionDto> children,
    /** Where the button navigates inside the app (a data-authored shell); null runs actionId. */
    String route) {}
