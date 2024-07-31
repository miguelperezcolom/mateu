package io.mateu.dtos;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyContainer implements Serializable {

  private String journeyId;

  private String journeyTypeId;

  private String remoteBaseUrl;

  private Class journeyClass;

  private Map<String, Object> journeyData;

  private Journey journey;

  private Map<String, Step> steps;

  private Step initialStep;

  private Map<String, Object> lastUsedFilters;

  private Map<String, List<SortCriteria>> lastUsedSorting;

  @Override
  public String toString() {
    return journeyId;
  }
}
