package io.mateu.core.application.out;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.concurrent.CompletableFuture;

public interface MateuHttpClient {
  CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request);

  /**
   * Sends the request propagating the caller's Authorization header (e.g. the keycloak JWT a shell
   * holds after login), so remote menus on secured services authenticate cross-service.
   * Implementations that cannot propagate credentials degrade to the unauthenticated call.
   */
  default CompletableFuture<UIIncrementDto> send(
      String baseUrl, RunActionRqDto request, String authorizationHeader) {
    return send(baseUrl, request);
  }

  /**
   * Sends the request with these headers (identity, correlation id) — what the host uses to resolve
   * a micro frontend on the user's behalf. Implementations that cannot send arbitrary headers fall
   * back to propagating only {@code Authorization}.
   */
  default CompletableFuture<UIIncrementDto> sendWithHeaders(
      String baseUrl, RunActionRqDto request, java.util.Map<String, String> headers) {
    String authorization = null;
    if (headers != null) {
      for (var entry : headers.entrySet()) {
        if ("authorization".equalsIgnoreCase(entry.getKey())) {
          authorization = entry.getValue();
        }
      }
    }
    return send(baseUrl, request, authorization);
  }
}
