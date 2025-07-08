package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AvatarDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Avatar;
import java.util.List;

public class AvatarComponentToDtoMapper {

  public static ClientSideComponentDto mapAvatarToDto(Avatar avatar) {
    return new ClientSideComponentDto(
        new AvatarDto(avatar.name(), avatar.abbreviation(), avatar.image()),
        "fieldId",
        List.of(),
        avatar.style(),
        avatar.cssClasses());
  }
}
