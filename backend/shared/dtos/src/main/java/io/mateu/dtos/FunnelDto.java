package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record FunnelDto(List<FunnelStageDto> stages) implements ComponentMetadataDto {

  public FunnelDto {
    stages = Collections.unmodifiableList(stages != null ? stages : Collections.emptyList());
  }

  @Override
  public List<FunnelStageDto> stages() {
    return Collections.unmodifiableList(stages);
  }
}
