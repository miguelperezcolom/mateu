package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;
import lombok.*;

public record Component(
    ViewMetadata metadata, String id, Map<String, Object> attributes, Map<String, Object> data) {

  public Component {
    attributes = Collections.unmodifiableMap(attributes);
    data = Collections.unmodifiableMap(data);
  }

  @Override
  public Map<String, Object> attributes() {
    return Collections.unmodifiableMap(attributes);
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }
}
