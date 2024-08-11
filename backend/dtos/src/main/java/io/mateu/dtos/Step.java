package io.mateu.dtos;

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

  public void mergeData(Map<String, Object> values) {
    if (values != null) {
      data.putAll(values);
    }
  }
}
