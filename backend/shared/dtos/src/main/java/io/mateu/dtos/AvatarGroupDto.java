package io.mateu.dtos;

import java.util.List;

/** Metadata for a html element */
public record AvatarGroupDto(List<AvatarDto> avatars, int maxItemsVisible)
    implements ComponentMetadataDto {}
