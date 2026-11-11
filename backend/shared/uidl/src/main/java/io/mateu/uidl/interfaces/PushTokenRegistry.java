package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.PushRegistration;

/**
 * Implemented by the {@code @UI} app class to let the Mateu mobile app receive PUSH notifications
 * from this UI. The app's drawer then offers "Notifications on this phone"; when the user turns it
 * on, the phone asks the OS for permission, gets its Expo push token and registers it with THIS UI
 * only ({@code _push-register}); turning it off, or removing the UI from the phone, unregisters it
 * ({@code _push-unregister}).
 *
 * <p>Mateu ships UI only: the token store and the sending are yours. Keep each registration (a
 * table keyed by {@code principal} + {@code token}), and when something happens post it to Expo
 * Push Service ({@code POST https://exp.host/--/api/v2/push/send}) with {@code "data": {"mateu":
 * {"ui": <uiKey>, "route": "/orders/42"}}} — the phone opens that route of this UI when the user
 * taps the notification. Drop a token when Expo answers {@code DeviceNotRegistered}.
 *
 * <p>Both methods receive the caller the host framework authenticated ({@link
 * PushRegistration#principal}) and the request: scope a registration to its principal, and
 * unregister only a token that principal registered. The token, the service, the platform and the
 * key are checked before your code runs; anything malformed is refused.
 */
@Experimental("push notifications on the Mateu mobile app (3.0)")
public interface PushTokenRegistry {

  /** The device wants this UI's notifications (sent again on every app start: be idempotent). */
  void registerPushToken(PushRegistration registration, HttpRequest httpRequest);

  /** The device no longer wants them (turned off, or the UI was removed from the phone). */
  void unregisterPushToken(PushRegistration registration, HttpRequest httpRequest);
}
