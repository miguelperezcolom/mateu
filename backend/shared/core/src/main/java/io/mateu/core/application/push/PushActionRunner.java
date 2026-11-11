package io.mateu.core.application.push;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.push.PushToken;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import reactor.core.publisher.Flux;

/**
 * The phone's side of remote push — two reserved app-level actions (dispatched with the app's
 * serverSideType, exempt from menu resolution like the bell's):
 *
 * <ul>
 *   <li>{@code _push-register} {@code {token, platform, deviceId, ui}} → keeps the token for the
 *       caller (the signed-in principal, else the anonymous session), answers {@code Data{_push:
 *       {registered: true|false}}} — false when the app sends no pushes.
 *   <li>{@code _push-unregister} {@code {token}} → forgets it (sign-out, the UI removed from the
 *       phone's list, notifications turned off). Needs no identity: a token is the phone's own
 *       secret, and forgetting it only stops pushes to that phone.
 * </ul>
 */
@Named
@Singleton
public class PushActionRunner implements ActionRunner {

  public static final String ACTION_PREFIX = "_push-";
  public static final String REGISTER_ACTION = ACTION_PREFIX + "register";
  public static final String UNREGISTER_ACTION = ACTION_PREFIX + "unregister";

  private static final Pattern TOKEN = Pattern.compile("[\\x21-\\x7E]{1,4096}");
  private static final Pattern DEVICE = Pattern.compile("[A-Za-z0-9._:-]{1,128}");
  private static final Set<String> PLATFORMS = Set.of("ios", "android", "web");

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return REGISTER_ACTION.equals(actionId) || UNREGISTER_ACTION.equals(actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var parameters = httpRequest.runActionRq().parameters();
    var token = text(parameters, "token");
    if (token == null || !TOKEN.matcher(token).matches()) {
      throw new UserFacingException("A push token is needed.");
    }
    if (UNREGISTER_ACTION.equals(command.actionId())) {
      Push.store().unregister(token);
      return Flux.just(answer(false));
    }
    if (!Push.available()) {
      // the app sends no pushes: keeping the token would only hold on to a phone's address
      return Flux.just(answer(false));
    }
    var owner = Push.ownerOf(httpRequest);
    if (owner == null) {
      return Flux.just(answer(false));
    }
    var platform = text(parameters, "platform");
    var deviceId = text(parameters, "deviceId");
    var ui = text(parameters, "ui");
    Push.store()
        .register(
            owner,
            new PushToken(
                token,
                platform != null && PLATFORMS.contains(platform) ? platform : null,
                deviceId != null && DEVICE.matcher(deviceId).matches() ? deviceId : null,
                webUrl(ui)));
    return Flux.just(answer(true));
  }

  private static Data answer(boolean registered) {
    return new Data(Map.of("_push", Map.of("registered", registered)));
  }

  /** The UI's base url as the phone knows it: an http(s) url, else nothing. */
  static String webUrl(String value) {
    if (value == null || value.length() > 2048) {
      return null;
    }
    try {
      var uri = URI.create(value);
      var scheme = uri.getScheme();
      return ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))
              && uri.getHost() != null
          ? value
          : null;
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private static String text(Map<String, Object> parameters, String key) {
    var value = parameters != null ? parameters.get(key) : null;
    return value instanceof String s && !s.isBlank() ? s.trim() : null;
  }
}
