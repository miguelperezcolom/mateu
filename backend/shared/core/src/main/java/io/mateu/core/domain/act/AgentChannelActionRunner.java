package io.mateu.core.domain.act;

import io.mateu.core.application.agentpush.AgentCaller;
import io.mateu.core.application.agentpush.AgentPush;
import io.mateu.core.application.agentpush.AgentSessions;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.dtos.AgentPushDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Flux;

/**
 * The UI side of live UI push — three app-level actions, all with {@code parameters: {sessionId,
 * secret}} (see {@code conformance/mcp/README.md}, "Live UI push"):
 *
 * <ul>
 *   <li>{@value AgentPush#CHANNEL_ACTION} (+ {@code route}, {@code renderer}), over the SSE
 *       endpoint every adapter already has: an open-ended stream of increments, each carrying one
 *       {@code AgentPush} command — first the session's status, then every message an MCP caller
 *       sends to it; an empty increment every {@value #HEARTBEAT_SECONDS} s; the end after {@value
 *       #MAX_MINUTES} minutes (the UI reconnects at once — an adapter does not always tell the
 *       stream that its browser went away);
 *   <li>{@value AgentPush#PAIR_ACTION} → {@code Data{_agentPairing: {code, expiresInSeconds}}};
 *   <li>{@value AgentPush#UNPAIR_ACTION} → {@code Data{_agentPairing: null}}.
 * </ul>
 *
 * With push off each of them is refused.
 */
@Named
@Singleton
public class AgentChannelActionRunner implements ActionRunner {

  static final int HEARTBEAT_SECONDS = 20;
  static final int MAX_MINUTES = 5;

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return AgentPush.CHANNEL_ACTION.equals(actionId)
        || AgentPush.PAIR_ACTION.equals(actionId)
        || AgentPush.UNPAIR_ACTION.equals(actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    if (!AgentPush.enabled()) {
      return Flux.error(new UserFacingException(AgentPush.DISABLED));
    }
    var httpRequest = command.httpRequest();
    var parameters = httpRequest.runActionRq().parameters();
    var sessionId = text(parameters, "sessionId");
    var secret = text(parameters, "secret");
    var principal = AgentCaller.principalOf(httpRequest);
    var sessions = AgentSessions.shared();
    try {
      if (AgentPush.PAIR_ACTION.equals(command.actionId())) {
        var code = sessions.pairingCode(sessionId, secret, principal);
        return Flux.just(new Data(Map.of(AgentPush.PAIRING_KEY, code)));
      }
      if (AgentPush.UNPAIR_ACTION.equals(command.actionId())) {
        sessions.unpair(sessionId, secret, principal);
        var data = new HashMap<String, Object>();
        data.put(AgentPush.PAIRING_KEY, null);
        return Flux.just(new Data(data));
      }
    } catch (RuntimeException e) {
      return Flux.error(e);
    }
    var route = text(parameters, "route");
    var renderer = text(parameters, "renderer");
    return Flux.<UIIncrementDto>create(
            sink -> {
              AgentSessions.Channel channel;
              try {
                channel =
                    sessions.open(
                        sessionId,
                        secret,
                        principal,
                        remoteAddress(httpRequest),
                        route,
                        renderer,
                        message -> sink.next(increment(message)),
                        sink::complete);
              } catch (RuntimeException e) {
                sink.error(e);
                return;
              }
              var heartbeat =
                  Flux.interval(Duration.ofSeconds(HEARTBEAT_SECONDS))
                      .subscribe(tick -> sink.next(UIIncrementDto.builder().build()));
              sink.onDispose(
                  () -> {
                    heartbeat.dispose();
                    channel.close();
                  });
            })
        .take(Duration.ofMinutes(MAX_MINUTES));
  }

  /** The increment carrying one message. */
  public static UIIncrementDto increment(AgentSessions.Message message) {
    return UIIncrementDto.builder()
        .commands(
            List.of(
                new UICommandDto(
                    null,
                    UICommandTypeDto.AgentPush,
                    new AgentPushDto(message.kind(), message.event(), message.detail()))))
        .build();
  }

  private static String remoteAddress(HttpRequest httpRequest) {
    try {
      return httpRequest.getRemoteAddress();
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static String text(Map<String, Object> parameters, String key) {
    var value = parameters != null ? parameters.get(key) : null;
    return value == null ? null : String.valueOf(value);
  }
}
