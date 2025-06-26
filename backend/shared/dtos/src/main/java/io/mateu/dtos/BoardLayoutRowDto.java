package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** A tab */
@Builder
public record BoardLayoutRowDto(List<ComponentDto> content) implements ComponentMetadataDto {}
