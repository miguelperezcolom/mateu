package com.example.demo.infra.ui.menus.util;

import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Getter
@Setter
public class ServletHttpRequestForm {

  @Autowired
  SerializerService serializerService;
  @ReadOnly
  String rq;

  @Action
  public void readRequest(ServerHttpRequest serverHttpRequest) throws Exception {
    this.rq = serializerService.toJson(serverHttpRequest);
  }
}
