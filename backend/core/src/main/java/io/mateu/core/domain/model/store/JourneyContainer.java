package io.mateu.core.domain.model.store;

import io.mateu.core.domain.uidefinition.shared.interfaces.SortCriteria;
import io.mateu.dtos.Journey;
import io.mateu.dtos.Step;
import jakarta.persistence.Id;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyContainer implements Serializable {

  @Id private String journeyId;

  private String journeyTypeId;

  private String remoteBaseUrl;

  private Class journeyClass;

  private Map<String, Object> journeyData;

  private Journey journey;

  private Map<String, Step> steps;

  private Step initialStep;

  private LocalDateTime created = LocalDateTime.now();

  private LocalDateTime lastAccess = LocalDateTime.now();

  private Map<String, Object> lastUsedFilters;

  private Map<String, List<SortCriteria>> lastUsedSorting;

  public void reset() {
    journey.setCurrentStepId(initialStep.getId());
    journey.setCurrentStepDefinitionId(initialStep.getType());
  }

  @Override
  public String toString() {
    return journeyId;
  }
}
