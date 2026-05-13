package io.mateu.dtos;

import lombok.Builder;

/** Metadata DTO for the mateu-form-editor web component. */
@Builder
public record FormEditorDto(String value) implements ComponentMetadataDto {}
