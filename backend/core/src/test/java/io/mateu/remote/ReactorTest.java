package io.mateu.remote;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

public class ReactorTest {

  @Test
  public void voidMonoCompletes() {
    Mono<Void> r = Mono.empty();
    StepVerifier.create(r).verifyComplete();
  }

  @Test
  public void contextIsRead() {
    Mono<Void> voidMono = Mono.empty().then();

    Mono<String> r =
        Mono.just("")
            .flatMap(s -> Mono.deferContextual(ctx -> Mono.just("Hello " + ctx.get("name"))))
            .flatMap(s -> Mono.deferContextual(ctx -> Mono.just("Hellos " + ctx.get("name"))));
    var s = r.contextWrite(ctx -> ctx.put("name", "Mateu"));
    var t = s.contextWrite(ctx -> ctx.put("name", "Antonia"));
    StepVerifier.create(t)
        .expectNext("Hellos Mateu")
        // .expectNext("Hellos Antonia")
        .verifyComplete();
  }

  @Test
  public void contextIsAlsoRead() {

    StepVerifier.create(Mono.empty().then(Mono.just("hols"))).expectNext("hols").verifyComplete();
  }

  @Test
  public void contextIsReadAgain() {
    var mono = Mono.deferContextual(ctx -> Mono.just("Hello " + ctx.get("name")));
    mono = mono.log();
    var s = mono.contextWrite(ctx -> ctx.put("name", "Mateu"));
    StepVerifier.create(s).expectNext("Hello Mateu").verifyComplete();
  }
}
