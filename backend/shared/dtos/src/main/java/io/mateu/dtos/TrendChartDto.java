package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record TrendChartDto(
    String title, List<Double> values, List<String> labels, String color, boolean area)
    implements ComponentMetadataDto {

  public TrendChartDto {
    values = Collections.unmodifiableList(values != null ? values : Collections.emptyList());
    labels = Collections.unmodifiableList(labels != null ? labels : Collections.emptyList());
  }

  @Override
  public List<Double> values() {
    return Collections.unmodifiableList(values);
  }

  @Override
  public List<String> labels() {
    return Collections.unmodifiableList(labels);
  }
}
