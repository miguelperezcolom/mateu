package io.mateu.core.application.push;

import io.mateu.core.infra.MateuSettings;
import io.mateu.uidl.PushNotifications;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PushSender;
import io.mateu.uidl.interfaces.PushTokenStore;
import io.mateu.uidl.push.PushMessage;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;

/**
 * Remote push (the reach of {@code @App(osNotifications = true)} beyond an app in front): which
 * {@link PushTokenStore} and {@link PushSender} are in use, and the delivery of one push to a
 * principal's phones — off the request thread, failures logged, tokens the service reports gone
 * unregistered.
 *
 * <ul>
 *   <li>Store: the app's bean, else Mateu's {@link InMemoryPushTokenStore} (a WARN the first time:
 *       it is lost on restart).
 *   <li>Sender: the app's bean, else {@link ExpoPushSender} when {@value #EXPO_ENABLED} is true
 *       ({@value #EXPO_ACCESS_TOKEN}, {@value #EXPO_URL} optional), else none: push is off.
 * </ul>
 */
@Slf4j
public final class Push {

  public static final String EXPO_ENABLED = "mateu.push.expo.enabled";
  public static final String EXPO_ACCESS_TOKEN = "mateu.push.expo.access-token";
  public static final String EXPO_URL = "mateu.push.expo.url";

  private static final InMemoryPushTokenStore DEFAULT_STORE = new InMemoryPushTokenStore();
  private static final AtomicBoolean WARNED = new AtomicBoolean();
  private static final ExecutorService DELIVERY =
      Executors.newFixedThreadPool(
          2,
          r -> {
            var thread = new Thread(r, "mateu-push");
            thread.setDaemon(true);
            return thread;
          });

  private static volatile ExpoPushSender expo;
  private static volatile String expoKey;

  private Push() {}

  /** Whether pushes can be sent at all: a sender is there. */
  public static boolean available() {
    return sender() != null;
  }

  /** The sender in use, or null when push is off. */
  public static PushSender sender() {
    var bean = bean(PushSender.class);
    if (bean != null) {
      return bean;
    }
    if (!MateuSettings.isTrue(EXPO_ENABLED)) {
      return null;
    }
    var url = MateuSettings.get(EXPO_URL);
    var token = MateuSettings.get(EXPO_ACCESS_TOKEN);
    var key = url + "\n" + token;
    var current = expo;
    if (current == null || !key.equals(expoKey)) {
      current = new ExpoPushSender(url, token);
      expo = current;
      expoKey = key;
    }
    return current;
  }

  /** The store in use: the app's bean, else Mateu's in-memory one. */
  public static PushTokenStore store() {
    var bean = bean(PushTokenStore.class);
    if (bean != null) {
      return bean;
    }
    if (WARNED.compareAndSet(false, true)) {
      log.warn(
          "Push tokens are kept in memory (no PushTokenStore bean): they are lost on restart and"
              + " not shared across nodes. Register a PushTokenStore to keep them.");
    }
    return DEFAULT_STORE;
  }

  /**
   * Whom a registration from this request is for: the signed-in caller, else the anonymous session
   * ({@code session:<X-Session-Id>}), else null (nothing to bind it to).
   */
  public static String ownerOf(HttpRequest httpRequest) {
    var principal = io.mateu.core.application.notifications.Inbox.principalOf(httpRequest);
    if (principal != null) {
      return principal;
    }
    var session = httpRequest != null ? httpRequest.getHeaderValue("X-Session-Id") : null;
    return session != null && !session.isBlank() && session.length() <= 128
        ? PushNotifications.sessionKey(session)
        : null;
  }

  /** Sends {@code message} to {@code principal}'s phones, off the calling thread. */
  public static void deliver(String principal, PushMessage message) {
    if (principal == null || message == null) {
      return;
    }
    var sender = sender();
    if (sender == null) {
      return;
    }
    var store = store();
    try {
      DELIVERY.execute(() -> deliverNow(principal, message, sender, store));
    } catch (RuntimeException e) {
      log.warn("A push could not be queued: {}", e.toString());
    }
  }

  /** The delivery itself (on the caller's thread): the tests call it directly. */
  static void deliverNow(
      String principal, PushMessage message, PushSender sender, PushTokenStore store) {
    try {
      var tokens = store.tokensFor(principal);
      if (tokens == null || tokens.isEmpty()) {
        return;
      }
      var result = sender.send(message, tokens);
      if (result != null) {
        result.unregisteredTokens().forEach(store::unregister);
      }
    } catch (RuntimeException e) {
      log.warn("A push could not be sent: {}", e.toString());
    }
  }

  private static <T> T bean(Class<T> type) {
    try {
      var beans = MateuBeanProvider.getSingletonBeans(type);
      if (!beans.isEmpty()) {
        return beans.iterator().next();
      }
    } catch (RuntimeException noContainer) {
      // no bean provider (a plain unit test)
    }
    return null;
  }
}
