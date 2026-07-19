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
}
