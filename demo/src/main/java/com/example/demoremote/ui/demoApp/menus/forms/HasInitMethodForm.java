package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.core.interfaces.HasInitMethod;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import lombok.Data;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Data
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
  public String toString() {
    return getClass().getSimpleName();
  }

  @Override
  public void init(ServerHttpRequest serverHttpRequest) {
    this.assessment = dump(serverHttpRequest);
  }
}
