package io.mateu.dtos;

import lombok.Builder;

/**
 * A button
 *
 * @param id This action targetId
 * @param icon Icon to be used
 * @param label Button text
 * @param type Action dataType: primary, secondary
 * @param visible If this button is visible
 * @param position Position in the action bar. Can be left or right
 */
@Builder
public record ButtonDto(
    String id,
    String actionId,
    String icon,
    String label,
    ActionTypeDto type,
    ActionStereotypeDto stereotype,
    ActionThemeVariantDto[] variants,
    boolean visible,
    ActionPositionDto position) {}
