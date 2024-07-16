package com.example.demo.infra.ui.menus.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import lombok.Data;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Data
public class ActionsWithParametersForm {

  private String someText;

  private int someValue;

  @ReadOnly private String assessment;

  @Action
  public void both(String name, int age, ServerHttpRequest serverHttpRequest) {
    this.someText = name;
    this.someValue = age;
    this.assessment = dump(serverHttpRequest);
  }

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

  @Action
  public void sayHello(String name, int age) {
    this.someText = name;
    this.someValue = age;
  }

  @Override
  public String toString() {
    return getClass().getSimpleName();
  }
}
