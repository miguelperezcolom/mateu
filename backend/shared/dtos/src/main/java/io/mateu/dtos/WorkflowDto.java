package io.mateu.dtos;

import lombok.Builder;

/** Metadata DTO for the mateu-workflow web component. */
@Builder
public record WorkflowDto(String value) implements ComponentMetadataDto {}
