package io.mateu.dtos;

import lombok.Builder;

/** A button */
@Builder
public record ButtonDto(
    String id, String actionId, String iconOnLeft, String iconOnRight, String label)
    implements ComponentMetadataDto {}
