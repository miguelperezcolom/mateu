package io.mateu.core.tests;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class ReactorTests {

  @Test
  public void fluxRuns() throws ExecutionException, InterruptedException, TimeoutException {
    Flux<String> flux =
        Flux.just("Mateu", "Antonia")
            .map(
                s -> {
                  System.out.println(s);
                  return s;
                });
    // flux.blockLast(Duration.ofSeconds(5));
    // flux.then().block(Duration.ofSeconds(5));
    flux.then().toFuture().get(5, TimeUnit.SECONDS);
  }

  @Test
  public void fluxDoesNotRun() {
    Flux<String> flux =
        Flux.just("Mateu", "Antonia")
            .flatMap(s -> Mono.just(s))
            .map(
                s -> {
                  System.out.println(s);
                  return s;
                });
    flux.then().block();
  }

  @Test
  public void fluxesRun() {
    Flux<String> flux0 = Flux.just("Mateu", "Antonia");
    Flux<String> flux1 = Flux.just("Miguel");
    Flux.concat(flux0, flux1)
        .map(
            s -> {
              System.out.println(s);
              return s;
            })
        .blockLast();
  }

  @Test
  public void fluxesRunAsOne() {
    Flux<String> flux0 = Flux.just("Mateu", "Antonia");
    Flux<String> flux1 = Flux.just("Miguel");
    Flux.concat(flux0, flux1)
        .map(
            s -> {
              System.out.println(s);
              return s;
            })
        .then()
        .block();
    Flux.merge(flux0, flux1)
        .map(
            s -> {
              System.out.println(s);
              return s;
            })
        .blockLast();
  }
}
