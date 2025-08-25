package io.mateu.dtos;

import lombok.Builder;

/**
 * A field validation
 *
 * @param message An text to show if not valid
 */
@Builder
public record ValidationDto(String condition, String fieldId, String message) {}
