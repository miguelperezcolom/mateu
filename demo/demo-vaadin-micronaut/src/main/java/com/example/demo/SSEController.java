package com.example.demo;

import io.mateu.dtos.UIIncrementDto;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.Produces;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Controller("/sse")
@Slf4j
public class SSEController {

  @Produces(MediaType.TEXT_EVENT_STREAM)
  @Post
  public Mono<UIIncrementDto> post1() throws Exception {
    return Mono.just(UIIncrementDto.builder().build());
  }

  @Produces(MediaType.TEXT_EVENT_STREAM)
  //@Post
  public Flux<UIIncrementDto> post() throws Exception {
    return Flux.fromStream(List.of(
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build()
    ).stream()).delayElements(Duration.ofSeconds(1));
  }

  @Produces(MediaType.TEXT_EVENT_STREAM)
  @Get
  public Flux<UIIncrementDto> get() throws Exception {
    return Flux.fromStream(List.of(
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build(),
            UIIncrementDto.builder().build()
    ).stream()).delayElements(Duration.ofSeconds(1));
  }
}
