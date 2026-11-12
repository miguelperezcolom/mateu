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
    // the notification inbox's changes, only those for THIS caller (or for everyone)
    var caller =
        io.mateu.core.infra.security.IdentityResolver.resolve(command.httpRequest()).name();
    Flux<UIIncrementDto> notifications =
        Flux.create(
            sink -> {
              var subscription =
                  io.mateu.uidl.LiveNotifications.subscribe(
                      change -> {
                        if (isFor(change, caller)) {
                          sink.next(increment(List.of(notificationsChanged(change))));
                        }
                      });
              sink.onDispose(
                  () -> {
                    try {
                      subscription.close();
                    } catch (Exception ignored) {
                      // nothing to release
                    }
                  });
            });
    // record presence: a change of a record THIS caller has open (in any tab) — never another's
    Flux<UIIncrementDto> presence = presenceChanges(instance, command, caller);
    Flux<UIIncrementDto> heartbeat =
        Flux.interval(Duration.ofSeconds(HEARTBEAT_SECONDS))
            .map(
                tick -> {
                  // a tab that went silent leaves its records here, even if nobody else calls
                  io.mateu.core.application.presence.Presence.sweep();
                  return UIIncrementDto.builder().build();
                });
    return catchUp.concatWith(
        Flux.merge(changes, notifications, presence, heartbeat)
            .take(Duration.ofMinutes(MAX_MINUTES)));
  }

  /** The presence changes for {@code caller}: none for an anonymous one. */
  static Flux<UIIncrementDto> presenceChanges(
      Object instance, RunActionCommand command, String caller) {
    if (caller == null
        || caller.isBlank()
        || !io.mateu.core.application.presence.Presence.enabledFor(instance, command)) {
      return Flux.empty();
    }
    var scope = io.mateu.core.application.presence.Presence.scopeOf(instance, command);
    return Flux.create(
        sink -> {
          var subscription =
              io.mateu.core.application.presence.Presence.store()
                  .onChange(
                      (changedScope, record) -> {
                        if (!scope.equals(changedScope)
                            || !io.mateu.core.application.presence.Presence.isOn(
                                scope, record, caller)) {
                          return;
                        }
                        var snapshot =
                            io.mateu.core.application.presence.Presence.snapshot(
                                scope, record, caller);
                        sink.next(
                            increment(
                                List.of(
                                    io.mateu.core.application.presence.Presence.command(
                                        snapshot))));
                      });
          sink.onDispose(
              () -> {
                try {
                  subscription.close();
                } catch (Exception ignored) {
                  // nothing to release
                }
              });
        });
  }

  static UICommandDto command(String id, String value) {
    return new UICommandDto(
        null, UICommandTypeDto.UpdateHeaderValue, new HeaderValueDto(id, null, value));
  }

  /** Whether a change reaches the caller: addressed to everyone, or to the caller's name. */
  static boolean isFor(io.mateu.uidl.LiveNotifications.Change change, String caller) {
    return change.principal() == null
        || (caller != null && !caller.isBlank() && caller.equals(change.principal()));
  }

  static UICommandDto notificationsChanged(io.mateu.uidl.LiveNotifications.Change change) {
    return new UICommandDto(
        null,
        UICommandTypeDto.NotificationsChanged,
        new io.mateu.dtos.NotificationsChangedDto(
            change.notification() != null
                ? NotificationsActionRunner.toDto(change.notification())
                : null,
            change.removedId()));
  }

  private static UIIncrementDto increment(List<UICommandDto> commands) {
    return UIIncrementDto.builder().commands(commands).build();
  }
}
