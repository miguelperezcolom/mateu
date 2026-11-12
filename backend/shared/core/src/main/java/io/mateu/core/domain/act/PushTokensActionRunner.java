package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.data.PushRegistration;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PushTokenRegistry;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import reactor.core.publisher.Flux;

/**
 * The mobile app's push registration: the {@code _push-register} / {@code _push-unregister}
 * app-level actions (dispatched with the app's serverSideType, exempt from menu resolution like the
 * inbox's). Parameters {@code {token, service, platform, uiKey}} are checked here — an Expo push
 * token, service {@code expo}, platform ios|android, an opaque key — and handed, with the caller
 * the host framework authenticated, to the app class's {@link PushTokenRegistry}. Mateu keeps
 * nothing. An app class without one refuses (403). Answers an empty increment.
 */
@lombok.extern.slf4j.Slf4j
@Named
@Singleton
public class PushTokensActionRunner implements ActionRunner {

  public static final String ACTION_PREFIX = "_push-";
  public static final String REGISTER_ACTION = ACTION_PREFIX + "register";
  public static final String UNREGISTER_ACTION = ACTION_PREFIX + "unregister";

  /** {@code ExponentPushToken[…]} (and the newer {@code ExpoPushToken[…]}). */
  static final Pattern EXPO_TOKEN =
      Pattern.compile("^Expo(nent)?PushToken\\[[A-Za-z0-9_\\-]{8,200}]$");

  static final Pattern UI_KEY = Pattern.compile("^[A-Za-z0-9_\\-]{8,64}$");
  static final Set<String> PLATFORMS = Set.of("ios", "android");

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
    var registry = findRegistry(instance, httpRequest);
    if (registry == null) {
      log.warn(
          "Refused {}: the app class does not implement PushTokenRegistry", command.actionId());
      throw new io.mateu.core.application.security.MateuForbiddenException(
          command.actionId() + ": this UI takes no push registrations");
    }
    var registration = registrationOf(httpRequest.runActionRq().parameters(), httpRequest);
    if (REGISTER_ACTION.equals(command.actionId())) {
      registry.registerPushToken(registration, httpRequest);
    } else {
      registry.unregisterPushToken(registration, httpRequest);
    }
    return Flux.just(UIIncrementDto.builder().build());
  }

  /** The parameters, validated: anything malformed never reaches the app's registry. */
  static PushRegistration registrationOf(Map<String, Object> parameters, HttpRequest httpRequest) {
    var token = stringOf(parameters, "token");
    var service = stringOf(parameters, "service");
    var platform = stringOf(parameters, "platform");
    var uiKey = stringOf(parameters, "uiKey");
    if (token == null
        || !EXPO_TOKEN.matcher(token).matches()
        || !PushRegistration.EXPO.equals(service)
        || platform == null
        || !PLATFORMS.contains(platform)
        || uiKey == null
        || !UI_KEY.matcher(uiKey).matches()) {
      throw new UserFacingException("Invalid push registration");
    }
    return new PushRegistration(
        token,
        service,
        platform,
        uiKey,
        io.mateu.core.application.notifications.Inbox.principalOf(httpRequest));
  }

  private static String stringOf(Map<String, Object> parameters, String key) {
    var value = parameters != null ? parameters.get(key) : null;
    return value instanceof String s ? s : null;
  }

  /** The app class, like the inbox: the widget sends the app's serverSideType. */
  private PushTokenRegistry findRegistry(Object instance, HttpRequest httpRequest) {
    if (instance instanceof PushTokenRegistry registry) {
      return registry;
    }
    var serverSideType = httpRequest.runActionRq().serverSideType();
    if (serverSideType != null && !serverSideType.isBlank()) {
      var appClass = forName(serverSideType);
      if (PushTokenRegistry.class.isAssignableFrom(appClass)) {
        return (PushTokenRegistry)
            io.mateu.uidl.di.MateuBeanProvider.getSingletonBean(
                    io.mateu.uidl.interfaces.InstanceFactory.class)
                .newInstance(appClass, Map.of(), httpRequest);
      }
    }
    return null;
  }
}
