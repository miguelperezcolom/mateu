package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.dtos.HeaderValueDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.LiveHeaderValues;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.time.Duration;
import java.util.List;
import reactor.core.publisher.Flux;

/**
 * The app EVENT STREAM of {@code @App(liveUpdates = true)}: the {@code _live-updates} app-level
 * action, called over the SSE endpoint every adapter already has ({@code v3/sse/**}), answers an
 * open-ended stream of increments carrying {@code UpdateHeaderValue} commands — first the last
 * value published for each id ({@link LiveHeaderValues#current()}), so a reconnecting browser
 * catches up, then every {@link LiveHeaderValues#publish(String, String)}.
 *
 * <p>An empty increment every {@value #HEARTBEAT_SECONDS} s keeps proxies from closing an idle
 * connection, and the stream ENDS after {@value #MAX_MINUTES} minutes — the browser reconnects at
 * once. That bound is deliberate: an adapter does not always tell the stream that its browser went
 * away, and a subscription nobody reads must not live forever.
 */
@Named
@Singleton
public class LiveUpdatesActionRunner implements ActionRunner {

  public static final String ACTION_ID = "_live-updates";
  static final int HEARTBEAT_SECONDS = 20;
  static final int MAX_MINUTES = 5;

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return ACTION_ID.equals(actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var snapshot = LiveHeaderValues.current();
    Flux<UIIncrementDto> catchUp =
        snapshot.isEmpty()
            ? Flux.just(UIIncrementDto.builder().build())
            : Flux.just(
                increment(
                    snapshot.entrySet().stream()
                        .map(e -> command(e.getKey(), e.getValue()))
                        .toList()));
    Flux<UIIncrementDto> changes =
        Flux.create(
            sink -> {
              var subscription =
                  LiveHeaderValues.subscribe(
                      value -> sink.next(increment(List.of(command(value.id(), value.value())))));
              sink.onDispose(
                  () -> {
                    try {
                      subscription.close();
                    } catch (Exception ignored) {
                      // nothing to release
                    }
                  });
            });
    Flux<UIIncrementDto> heartbeat =
        Flux.interval(Duration.ofSeconds(HEARTBEAT_SECONDS))
            .map(tick -> UIIncrementDto.builder().build());
    return catchUp.concatWith(Flux.merge(changes, heartbeat).take(Duration.ofMinutes(MAX_MINUTES)));
  }

  static UICommandDto command(String id, String value) {
    return new UICommandDto(
        null, UICommandTypeDto.UpdateHeaderValue, new HeaderValueDto(id, null, value));
  }

  private static UIIncrementDto increment(List<UICommandDto> commands) {
    return UIIncrementDto.builder().commands(commands).build();
  }
}
