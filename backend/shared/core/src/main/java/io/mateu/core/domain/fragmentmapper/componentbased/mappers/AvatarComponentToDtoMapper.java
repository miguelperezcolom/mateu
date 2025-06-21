package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AvatarDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.Avatar;
import java.util.List;

public class AvatarComponentToDtoMapper {

  public static ComponentDto mapAvatarToDto(Avatar avatar) {
    return new ComponentDto(
        new AvatarDto(avatar.name(), avatar.abbreviation(), avatar.image()),
        "fieldId",
        null,
        List.of());
  }
}
