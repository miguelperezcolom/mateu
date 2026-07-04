package io.mateu.dtos;

import lombok.Builder;

/** Shimmering loading placeholder */
@Builder
public record SkeletonDto(String variant, int count) implements ComponentMetadataDto {}
