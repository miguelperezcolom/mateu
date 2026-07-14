package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record StatDto(
    String label,
    String value,
    String unit,
    String delta,
    String trend,
    List<Double> spark,
    String actionId)
    implements ComponentMetadataDto {

  public StatDto {
    spark = Collections.unmodifiableList(spark != null ? spark : Collections.emptyList());
  }

  @Override
  public List<Double> spark() {
    return Collections.unmodifiableList(spark);
  }
}
