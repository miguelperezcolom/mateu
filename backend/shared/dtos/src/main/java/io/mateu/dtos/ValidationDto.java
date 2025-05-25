package io.mateu.dtos;

/**
 * A field validation
 *
 * @param type Validation dataType: required, min, max, pattern
 * @param message An text to show if not valid
 * @param data Data needed to perform the validation
 */
public record ValidationDto(ValidationTypeDto type, String message, Object data) {}
