package io.mateu.remote;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import reactor.core.publisher.Mono;

/** Unit test for simple App. */
public class AppTest {
  /** Rigorous Test :-) */
  @Test
  public void shouldAnswerWithTrue() {
    assertTrue(true);
  }

  @Test
  public void shouldDoSomething() {
    Mono.empty()
        .flatMap(
            o -> {
              System.out.println("Hola!!!!!");
              return Mono.empty();
            })
        .subscribe();
  }
}
