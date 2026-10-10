package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * A street map: centre, zoom, markers, the action a marker click runs and, optionally, the tile
 * provider ({@code tileUrl} template + {@code attribution}; null = OpenStreetMap).
 */
@Builder
public record MapDto(
    String position,
    String zoom,
    List<MapMarkerDto> markers,
    String markerActionId,
    String tileUrl,
    String attribution)
    implements ComponentMetadataDto {

  public MapDto(String position, String zoom) {
    this(position, zoom, List.of(), null, null, null);
  }

  public MapDto(String position, String zoom, List<MapMarkerDto> markers, String markerActionId) {
    this(position, zoom, markers, markerActionId, null, null);
  }
}
