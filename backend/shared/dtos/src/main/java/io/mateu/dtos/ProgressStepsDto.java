package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record ProgressStepsDto(List<StepDto> steps, boolean vertical)
    implements ComponentMetadataDto {

  public ProgressStepsDto {
    steps = Collections.unmodifiableList(steps != null ? steps : Collections.emptyList());
  }

  @Override
  public List<StepDto> steps() {
    return Collections.unmodifiableList(steps);
  }
}
