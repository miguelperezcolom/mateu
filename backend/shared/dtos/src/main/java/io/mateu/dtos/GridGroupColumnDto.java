package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** Metadata for a html element */
@Builder
public record GridGroupColumnDto(
    String id, String label, String style, String cssClasses, List<GridColumnDto> columns)
    implements ComponentMetadataDto {}
