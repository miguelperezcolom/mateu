package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** A button */
@Builder
public record ButtonDto(
    String label,
    String iconOnLeft,
    String iconOnRight,
    String image,
    ButtonColorDto color,
    ButtonVariantDto variant,
    ButtonStyleDto buttonStyle,
    ButtonSizeDto size,
    boolean autofocus,
    boolean disabled,
    String actionId,
    Object parameters,
    String shortcut,
    boolean separatorBefore,
    List<ButtonDto> children,
    /**
     * A route this button NAVIGATES to on the client, instead of running an action on the server —
     * the button counterpart of a listing's {@code rowRoute} or a menu {@code RouteLink}. Set from
     * a {@code RouteLink} actionable; the client interpolates {@code ${state.x}} against the page
     * state and dispatches the shell's navigate pair. A plain action button leaves it null.
     */
    String route,
    /**
     * The button's action needs selected listing rows (a bulk action): the renderer disables it
     * while nothing is selected. On the button itself, so no renderer has to find the advertised
     * action by id — the dispatched id and the advertised one are not always the same string.
     */
    boolean rowsSelectedRequired)
    implements ComponentMetadataDto {}
