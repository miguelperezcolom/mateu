package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record FeatureGridDto(List<FeatureDto> features, int columns)
    implements ComponentMetadataDto {

  public FeatureGridDto {
    features = Collections.unmodifiableList(features != null ? features : Collections.emptyList());
  }

  @Override
  public List<FeatureDto> features() {
    return Collections.unmodifiableList(features);
  }
}
