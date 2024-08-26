package io.mateu.core.domain.queries.getListCount;

import java.util.Collections;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public record GetListCountQuery(
    String componentType, Map<String, Object> data, ServerHttpRequest serverHttpRequest) {

  public GetListCountQuery {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }
}
