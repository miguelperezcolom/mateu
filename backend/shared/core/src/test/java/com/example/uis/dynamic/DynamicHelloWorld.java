package com.example.uis.dynamic;

import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public class DynamicHelloWorld implements DynamicUI {
  @Override
  public Mono<UIDto> build(String baseUrl, HttpRequest httpRequest) {
    return Mono.just(UIDto.builder().title("Hello world").build());
  }
}
