package io.mateu.uidl;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.push.PushMessage;

/**
 * Sends a push notification to a user's phones — the remote half of {@code @App(osNotifications =
 * true)}: it reaches the phone while the Mateu app is suspended or closed. Mateu already sends one
 * for every {@code inbox} message it stores for a signed-in caller; call this for what your own
 * code puts in the inbox (your {@code InboxStore} / {@code NotificationsSupplier}) or for anything
 * else.
 *
 * <p>Nothing is sent unless the app has a {@code PushSender} (its bean, or Mateu's Expo sender with
 * {@code mateu.push.expo.enabled=true}) and the user's phone registered a token. Sending happens
 * off the calling thread; failures are logged, never thrown.
 *
 * <pre>{@code
 * inbox.add(user, entry);
 * LiveNotifications.publish(user, entry);   // the open sessions' bells
 * PushNotifications.send(user, entry);      // the user's phones
 * }</pre>
 */
@Experimental("remote push (3.0)")
public final class PushNotifications {

  /** What Mateu's core does with a push (found as a bean); an app does not implement it. */
  @io.mateu.uidl.annotations.Internal("the framework's push delivery")
  public interface Dispatcher {
    void send(String principal, PushMessage message);
  }

  private PushNotifications() {}

  /** Sends {@code message} to the phones {@code principal} registered. */
  public static void send(String principal, PushMessage message) {
    if (principal == null || principal.isBlank() || message == null) {
      return;
    }
    dispatcher().send(principal, message);
  }

  /** Sends an inbox entry as a push: its title, its text, its route. */
  public static void send(String principal, AppNotification entry) {
    if (entry != null) {
      send(principal, PushMessage.of(entry));
    }
  }

  /**
   * Sends {@code message} to the phone of an ANONYMOUS session (its {@code X-Session-Id}): a phone
   * that registered with no signed-in user is kept under that session only.
   */
  public static void sendToSession(String sessionId, PushMessage message) {
    if (sessionId != null && !sessionId.isBlank()) {
      send(sessionKey(sessionId), message);
    }
  }

  /** The store key of an anonymous session's tokens. */
  public static String sessionKey(String sessionId) {
    return "session:" + sessionId;
  }

  private static Dispatcher dispatcher() {
    try {
      var beans = MateuBeanProvider.getSingletonBeans(Dispatcher.class);
      if (!beans.isEmpty()) {
        return beans.iterator().next();
      }
    } catch (RuntimeException noContainer) {
      // no container: nothing can be sent
    }
    return (principal, message) -> {};
  }
}
