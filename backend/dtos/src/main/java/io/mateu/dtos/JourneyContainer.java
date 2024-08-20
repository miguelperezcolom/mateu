package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public record JourneyContainer(
    String journeyId,
    String journeyTypeId,
    Class journeyClass,
    Map<String, Object> journeyData,
    Journey journey,
    Map<String, Step> steps,
    List<String> stepHistory,
    String initialStep,
    Map<String, Object> lastUsedFilters,
    Map<String, List<SortCriteria>> lastUsedSorting,
    boolean modalMustBeClosed) {

  public JourneyContainer {
    journeyData = journeyData != null ? Collections.unmodifiableMap(journeyData) : Map.of();
    steps = steps != null ? Collections.unmodifiableMap(steps) : Map.of();
    stepHistory = stepHistory != null ? Collections.unmodifiableList(stepHistory) : List.of();
    lastUsedFilters =
        lastUsedFilters != null ? Collections.unmodifiableMap(lastUsedFilters) : Map.of();
    lastUsedSorting =
        lastUsedSorting != null ? Collections.unmodifiableMap(lastUsedSorting) : Map.of();
  }

  @Override
  public Map<String, Object> journeyData() {
    return Collections.unmodifiableMap(journeyData);
  }

  @Override
  public Map<String, Step> steps() {
    return Collections.unmodifiableMap(steps);
  }

  @Override
  public List<String> stepHistory() {
    return Collections.unmodifiableList(stepHistory);
  }

  @Override
  public Map<String, Object> lastUsedFilters() {
    return Collections.unmodifiableMap(lastUsedFilters);
  }

  @Override
  public Map<String, List<SortCriteria>> lastUsedSorting() {
    return Collections.unmodifiableMap(lastUsedSorting);
  }

  @Override
  public String toString() {
    return journeyId;
  }
}
