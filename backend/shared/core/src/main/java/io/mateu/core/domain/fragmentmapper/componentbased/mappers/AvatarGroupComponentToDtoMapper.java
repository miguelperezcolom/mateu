package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AvatarDto;
import io.mateu.dtos.AvatarGroupDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.AvatarGroup;
import java.util.List;

public class AvatarGroupComponentToDtoMapper {

  public static ComponentDto mapAvatarGroupToDto(AvatarGroup avatarGroup) {
    return new ComponentDto(
        new AvatarGroupDto(
            avatarGroup.avatars().stream()
                .map(avatar -> new AvatarDto(avatar.name(), avatar.abbreviation(), avatar.image()))
                .toList(),
            avatarGroup.maxItemsVisible()),
        "fieldId",
        null,
        List.of());
  }
}
