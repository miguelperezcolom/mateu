package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.IconDto;
import io.mateu.uidl.data.Icon;
import java.util.List;

public class IconComponentToDtoMapper {

  public static ClientSideComponentDto mapIconToDto(Icon icon) {
    return new ClientSideComponentDto(new IconDto(icon.icon().iconName), "fieldId", List.of());
  }
}
