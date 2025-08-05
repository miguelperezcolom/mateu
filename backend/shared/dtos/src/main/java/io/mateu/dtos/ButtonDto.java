package io.mateu.dtos;

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
    String actionId)
    implements ComponentMetadataDto {}
