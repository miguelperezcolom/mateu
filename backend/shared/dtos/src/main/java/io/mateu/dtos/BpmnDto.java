package io.mateu.dtos;

import lombok.Builder;

/** Card metadata */
@Builder
public record BpmnDto(String xml) implements ComponentMetadataDto {}
