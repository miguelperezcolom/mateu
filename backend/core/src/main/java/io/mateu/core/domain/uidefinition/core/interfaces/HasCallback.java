package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface HasCallback<T> {

  void callback(GoBack<T> data, ServerHttpRequest serverHttpRequest);
}
