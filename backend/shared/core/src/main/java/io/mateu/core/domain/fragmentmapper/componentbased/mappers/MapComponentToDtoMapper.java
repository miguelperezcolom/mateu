package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MapDto;
import io.mateu.uidl.data.Map;
import java.util.List;

public class MapComponentToDtoMapper {

  public static ClientSideComponentDto mapMapToDto(Map map) {
    return new ClientSideComponentDto(new MapDto(map.position(), map.zoom()), "fieldId", List.of());
  }
}
