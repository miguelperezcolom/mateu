package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AvatarDto;
import io.mateu.dtos.AvatarGroupDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.AvatarGroup;
import java.util.List;

public class AvatarGroupComponentToDtoMapper {

  public static ClientSideComponentDto mapAvatarGroupToDto(AvatarGroup avatarGroup) {
    return new ClientSideComponentDto(
        new AvatarGroupDto(
            avatarGroup.avatars().stream()
                .map(avatar -> new AvatarDto(avatar.name(), avatar.abbreviation(), avatar.image()))
                .toList(),
            avatarGroup.maxItemsVisible()),
        "fieldId",
        List.of());
  }
}
