package io.mateu.dtos;

import lombok.Builder;

/** Metadata DTO for the mateu-workflow-elk web component. */
@Builder
public record WorkflowElkDto(String value, boolean readOnly) implements ComponentMetadataDto {}
