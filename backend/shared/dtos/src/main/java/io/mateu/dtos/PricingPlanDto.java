package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record PricingPlanDto(
    String id,
    String name,
    String price,
    String period,
    boolean featured,
    List<String> features,
    String ctaLabel,
    String actionId) {

  public PricingPlanDto {
    features = Collections.unmodifiableList(features != null ? features : Collections.emptyList());
  }

  @Override
  public List<String> features() {
    return Collections.unmodifiableList(features);
  }
}
