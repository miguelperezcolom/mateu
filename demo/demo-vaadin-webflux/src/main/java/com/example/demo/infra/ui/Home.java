package com.example.demo.infra.ui;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.RawContent;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.interfaces.ConsumesContextData;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Title("")
@MateuUI("")
@io.mateu.uidl.annotations.ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
@Slf4j
@FavIcon("/images/mateu-favicon.png")
public class Home extends DemoApp implements ConsumesContextData {

  @Section(value = "", leftSideImageUrl = "/myassets/background.svg")
  @RawContent
  String someContent =
      """

            <h1>Hello you!</h1>

            <p>This is some content for the home page.</p>

            """;

  @RawContent
  String dataFromContext;

  @Override
  public void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest) {
    log.info("received context: {}", context);
    dataFromContext = "context data: " + context.toString();
  }
}
