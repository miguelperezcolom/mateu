package io.mateu.uidl.interfaces;

import io.mateu.dtos.UIIncrementDto;

/**
 * Marks a component/view that knows how to map itself directly to the wire model. Implement {@link
 * #toUIIncrementDto()} to bypass the reflection-based mappers and return a ready-built {@link
 * UIIncrementDto} that the frontend renders as-is.
 */
public interface MapsToDto {

  UIIncrementDto toUIIncrementDto();
}
