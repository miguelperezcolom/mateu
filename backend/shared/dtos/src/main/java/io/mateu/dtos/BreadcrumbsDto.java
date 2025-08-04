package io.mateu.dtos;

import java.util.List;

/** A badge */
public record BreadcrumbsDto(String currentItemText, List<BreadcrumbDto> breadcrumbs)
    implements ComponentMetadataDto {}
