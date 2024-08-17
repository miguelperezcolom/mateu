package io.mateu.core.domain.uidefinition.core.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.Map;

public interface ConsumesContextData {

  void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest);
  
}
