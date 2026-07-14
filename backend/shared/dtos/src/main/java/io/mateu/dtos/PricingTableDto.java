package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record PricingTableDto(List<PricingPlanDto> plans) implements ComponentMetadataDto {

  public PricingTableDto {
    plans = Collections.unmodifiableList(plans != null ? plans : Collections.emptyList());
  }

  @Override
  public List<PricingPlanDto> plans() {
    return Collections.unmodifiableList(plans);
  }
}
