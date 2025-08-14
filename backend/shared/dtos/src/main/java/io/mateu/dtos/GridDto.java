package io.mateu.dtos;

import java.util.List;

/** Metadata for a html element */
public record GridDto(List<ComponentDto> content, DataPageDto page, boolean tree)
    implements ComponentMetadataDto {}
