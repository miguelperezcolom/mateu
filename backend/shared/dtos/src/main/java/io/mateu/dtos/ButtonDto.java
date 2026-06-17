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
    List<ButtonDto> children)
    implements ComponentMetadataDto {}
