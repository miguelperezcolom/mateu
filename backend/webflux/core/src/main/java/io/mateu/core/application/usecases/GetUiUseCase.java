package io.mateu.core.application.usecases;

import io.mateu.core.domain.queries.getUI.GetUIQuery;
import io.mateu.core.domain.queries.getUI.GetUIQueryHandler;
import io.mateu.dtos.UI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetUiUseCase {

  private final GetUIQueryHandler getUIQueryHandler;

  public GetUiUseCase(GetUIQueryHandler getUIQueryHandler) {
    this.getUIQueryHandler = getUIQueryHandler;
  }

  public Mono<UI> getUI(String uiId, String baseUrl, ServerHttpRequest serverHttpRequest)
      throws Exception {
    log.info("Get UI with targetId {} {}", uiId, baseUrl);
    return Mono.just(getUIQueryHandler.run(new GetUIQuery(uiId, baseUrl), serverHttpRequest));
  }
}
