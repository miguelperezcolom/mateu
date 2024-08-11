package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;
import lombok.*;

public record Component(ViewMetadata metadata, String id, Map<String, Object> attributes) {

  public Component {
    attributes = Collections.unmodifiableMap(attributes);
  }

  @Override
  public Map<String, Object> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}
