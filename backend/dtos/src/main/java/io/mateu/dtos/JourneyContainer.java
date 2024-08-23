package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Container for a journey
 *
 * @param journeyId The id for this journey
 * @param journeyTypeId The type id for this journey
 * @param journey Some info about the journey
 * @param steps The steps viewed in this journey
 * @param stepHistory The step ids viewed in this journey
 * @param initialStep The first step in his journey
 * @param modalMustBeClosed If true then the current modal must be closed
 */
public record JourneyContainer(
    String journeyId,
    String journeyTypeId,
    Journey journey,
    Map<String, Step> steps,
    List<String> stepHistory,
    String initialStep,
    boolean modalMustBeClosed) {

  public JourneyContainer {
    steps = steps != null ? Collections.unmodifiableMap(steps) : Map.of();
    stepHistory = stepHistory != null ? Collections.unmodifiableList(stepHistory) : List.of();
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
  public String toString() {
    return journeyId;
  }
}
