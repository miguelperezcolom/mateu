package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MapDto;
import io.mateu.uidl.data.Map;
import java.util.List;

public class MapComponentToDtoMapper {

  public static ComponentDto mapMapToDto(Map map) {
    return new ComponentDto(new MapDto(map.position(), map.zoom()), "fieldId", null, List.of());
  }
}
