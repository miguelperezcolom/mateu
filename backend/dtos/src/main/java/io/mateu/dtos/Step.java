package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.*;

public record Step(
    String id,
    String name,
    String type,
    View view,
    Map<String, Object> data,
    List<Rule> rules,
    String previousStepId,
    String target) {

  public Step {
    data = Collections.unmodifiableMap(data);
    rules = Collections.unmodifiableList(rules);
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public List<Rule> rules() {
    return Collections.unmodifiableList(rules);
  }
}
