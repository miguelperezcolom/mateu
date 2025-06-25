package io.mateu.dtos;

import java.util.List;

/** Metadata for a html element */
public record GridDto(List<GridColumnDto> columns, DataPageDto page, boolean tree)
    implements ComponentMetadataDto {}
