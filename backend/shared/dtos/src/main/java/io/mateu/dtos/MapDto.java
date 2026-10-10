package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** A street map: centre, zoom, markers and the action a marker click runs. */
@Builder
public record MapDto(
    String position, String zoom, List<MapMarkerDto> markers, String markerActionId)
    implements ComponentMetadataDto {

  public MapDto(String position, String zoom) {
    this(position, zoom, List.of(), null);
  }
}
