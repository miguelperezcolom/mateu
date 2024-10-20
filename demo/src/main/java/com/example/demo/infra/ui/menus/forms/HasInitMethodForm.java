package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Getter@Setter
public class HasInitMethodForm implements HasInitMethod {

  private String someText;

  @ReadOnly private String assessment;

  @Action
  public void printHtpRequest(ServerHttpRequest serverHttpRequest) {
    this.assessment = dump(serverHttpRequest);
  }

  private String dump(ServerHttpRequest serverHttpRequest) {
    if (serverHttpRequest == null) {
      return "request is null";
    }
    String txt = "";
    txt += serverHttpRequest.getLocalAddress();
    txt += "|";
    txt += serverHttpRequest.getPath();
    txt += "|";
    for (String key : serverHttpRequest.getHeaders().keySet()) {
      txt += "," + key + ":" + serverHttpRequest.getHeaders().get(key);
    }
    txt += serverHttpRequest.getPath();
    return txt;
  }

  @Override
  public void init(ServerHttpRequest serverHttpRequest) {
    this.assessment = dump(serverHttpRequest);
  }
}
