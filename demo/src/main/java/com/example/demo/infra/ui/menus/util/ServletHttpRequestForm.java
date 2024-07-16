package com.example.demo.infra.ui.menus.util;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.util.Serializer;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Getter
@Setter
public class ServletHttpRequestForm {

  @Autowired Serializer serializer;
  @ReadOnly String rq;

  @Action
  public void readRequest(ServerHttpRequest serverHttpRequest) throws Exception {
    this.rq = serializer.toJson(serverHttpRequest);
  }
}
