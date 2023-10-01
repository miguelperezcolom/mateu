package com.example.demoremote.ui.demoApp.menus.util;

import io.mateu.core.infra.authPropagation.ReactiveRequestContextHolder;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import java.util.concurrent.ExecutionException;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Getter
@Setter
public class ServletHttpRequestForm {

  @ReadOnly String rq;

  @Action
  public void readRequest() throws ExecutionException, InterruptedException {
    ServerHttpRequest rq = ReactiveRequestContextHolder.getRequest().toFuture().get();
    this.rq = rq.toString();
  }
}
