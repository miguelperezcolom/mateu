package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * One device asking ONE UI for push notifications (or to stop them): what the Mateu mobile app
 * sends with the {@code _push-register} / {@code _push-unregister} app-level actions, already
 * validated, handed to the app's {@code PushTokenRegistry}.
 *
 * <ul>
 *   <li>{@code token} — the device's push token for the {@code service} (an Expo push token, {@code
 *       ExponentPushToken[…]}). It is the address to send to: keep it like a credential.
 *   <li>{@code service} — the push service the token belongs to; {@code "expo"} (Expo Push Service,
 *       which forwards to APNs / FCM) is the only one in 3.0.
 *   <li>{@code platform} — {@code "ios"} or {@code "android"}.
 *   <li>{@code uiKey} — an opaque key the app drew for THIS UI on THIS device. Send it back in
 *       every push ({@code data.mateu.ui}): it is how the phone knows which of its UIs a
 *       notification belongs to, and a push without a key the phone holds opens nothing.
 *   <li>{@code principal} — the name of the caller the host framework authenticated (never a value
 *       from the request body); null for an anonymous caller.
 * </ul>
 */
@Experimental("push notifications on the Mateu mobile app (3.0)")
@Builder(toBuilder = true)
public record PushRegistration(
    String token, String service, String platform, String uiKey, String principal) {

  /** The push service of the Mateu mobile app. */
  public static final String EXPO = "expo";
}
