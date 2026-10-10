package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MapDto;
import io.mateu.dtos.MapMarkerDto;
import io.mateu.uidl.data.Map;
import java.util.List;

public class MapComponentMapper {

  public static ClientSideComponentDto mapMapToDto(Map map) {
    return new ClientSideComponentDto(
        new MapDto(
            map.position(),
            map.zoom(),
            map.markers().stream()
                .map(
                    marker ->
                        new MapMarkerDto(
                            marker.id(),
                            marker.latitude(),
                            marker.longitude(),
                            marker.label(),
                            marker.description(),
                            marker.color()))
                .toList(),
            map.markerActionId()),
        map.id() != null ? map.id() : "map",
        List.of(),
        map.style(),
        map.cssClasses(),
        null);
  }
}
