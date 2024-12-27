package io.mateu.uidl.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface ConsumesUrlFragment {

  Object consume(String urlFragment, ServerHttpRequest serverHttpRequest);
  
}
