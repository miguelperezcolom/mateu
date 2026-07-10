package io.mateu.dtos;

/** Chat-style message input; submitting fires {@code actionId} with the text as {@code message}. */
public record MessageInputDto(String actionId) implements ComponentMetadataDto {}
