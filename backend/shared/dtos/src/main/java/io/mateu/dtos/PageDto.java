package io.mateu.dtos;

import lombok.Builder;

/** Page metadata */
@Builder
public record PageDto(String id, String favicon, String pageTitle, ComponentDto mainContent)
    implements ComponentMetadataDto {}
