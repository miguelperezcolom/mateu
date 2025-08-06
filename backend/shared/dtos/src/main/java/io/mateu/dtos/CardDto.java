package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** Card metadata */
@Builder
public record CardDto(
    ComponentDto media,
    ComponentDto headerPrefix,
    ComponentDto header,
    ComponentDto title,
    ComponentDto subtitle,
    ComponentDto headerSuffix,
    ComponentDto content,
    ComponentDto footer,
    List<CardVariantDto> variants)
    implements ComponentMetadataDto {}
