package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.IconDto;
import io.mateu.uidl.data.Icon;
import java.util.List;

public class IconComponentToDtoMapper {

  public static ComponentDto mapIconToDto(Icon icon) {
    return new ComponentDto(new IconDto(icon.icon().iconName), "fieldId", null, List.of());
  }
}
