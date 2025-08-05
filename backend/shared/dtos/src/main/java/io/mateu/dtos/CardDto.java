package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** Card metadata */
@Builder
public record CardDto(
    CardImageDto image,
    String headerPrefix,
    String header,
    String title,
    String subtitle,
    String headerSuffix,
    CardContentDto content,
    List<CardVariantDto> variants,
    String footer)
    implements ComponentMetadataDto {}
