package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;
import lombok.*;

public record StepWrapper(
    Journey journey, Step step, Map<String, Object> store, boolean modalMustBeClosed) {

  public StepWrapper {
    store = Collections.unmodifiableMap(store);
  }

  @Override
  public Map<String, Object> store() {
    return Collections.unmodifiableMap(store);
  }
}
