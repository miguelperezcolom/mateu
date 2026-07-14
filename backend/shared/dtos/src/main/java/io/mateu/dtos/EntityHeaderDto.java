package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record EntityHeaderDto(
    String title,
    List<ChipDto> badges,
    String subtitle,
    List<FactDto> facts,
    String metricLabel,
    String metricValue,
    String metricCaption)
    implements ComponentMetadataDto {

  public EntityHeaderDto {
    badges = Collections.unmodifiableList(badges != null ? badges : Collections.emptyList());
    facts = Collections.unmodifiableList(facts != null ? facts : Collections.emptyList());
  }

  @Override
  public List<ChipDto> badges() {
    return Collections.unmodifiableList(badges);
  }

  @Override
  public List<FactDto> facts() {
    return Collections.unmodifiableList(facts);
  }
}
