package io.mateu.uidl.interfaces;

import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface ConsumesContextData {

  void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest);
}
