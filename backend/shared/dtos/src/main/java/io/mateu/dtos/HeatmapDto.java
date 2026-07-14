package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record HeatmapDto(List<HeatCellDto> cells) implements ComponentMetadataDto {

  public HeatmapDto {
    cells = Collections.unmodifiableList(cells != null ? cells : Collections.emptyList());
  }

  @Override
  public List<HeatCellDto> cells() {
    return Collections.unmodifiableList(cells);
  }
}
