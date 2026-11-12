package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.push.PushMessage;
import io.mateu.uidl.push.PushResult;
import io.mateu.uidl.push.PushToken;
import java.util.List;

/**
 * Sends a push to phones (remote push, {@code @App(osNotifications = true)}). Mateu ships UI only:
 * delivery is the app's — register a bean implementing this (your own push service, FCM/APNs
 * directly…), or turn on Mateu's optional Expo sender with {@code mateu.push.expo.enabled=true}.
 *
 * <p>Each push must carry, as data, {@code ui} = {@link PushToken#ui()} and {@code route} = {@link
 * PushMessage#route()}: that is what lets the phone open the right UI at the right screen on a tap.
 * Mateu calls this off the request thread.
 */
@Experimental("remote push (3.0)")
public interface PushSender {

  /** Sends {@code message} to {@code tokens}; reports the tokens the service no longer knows. */
  PushResult send(PushMessage message, List<PushToken> tokens);
}
