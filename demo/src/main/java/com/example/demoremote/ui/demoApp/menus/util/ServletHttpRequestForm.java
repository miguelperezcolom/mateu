package com.example.demoremote.ui.demoApp.menus.util;

import io.mateu.core.infra.authPropagation.ReactiveRequestContextHolder;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import java.util.concurrent.ExecutionException;

import io.mateu.util.Helper;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

@Getter
@Setter
public class ServletHttpRequestForm {

  @ReadOnly String rq;

  @Action
  public Mono<Void> readRequest() throws ExecutionException, InterruptedException {
    return ReactiveRequestContextHolder.getRequest().doOnNext(serverHttpRequest -> {
      try {
        this.rq = Helper.toJson(serverHttpRequest);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }).then();
  }
}
