package io.mateu.uidl.interfaces;

import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface UpdatesContextData {

  String getContextData(Map<String, Object> context, ServerHttpRequest serverHttpRequest);
}
