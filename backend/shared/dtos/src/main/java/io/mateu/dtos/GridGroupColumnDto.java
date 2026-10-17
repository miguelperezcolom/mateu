package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * A header group spanning several grid columns. {@code columns} are the grouped columns, each a
 * ClientSide-wrapped {@code GridColumn} exactly like the grid's own {@code content}.
 */
@Builder
public record GridGroupColumnDto(
    String id, String label, String style, String cssClasses, List<ComponentDto> columns)
    implements ComponentMetadataDto {}
