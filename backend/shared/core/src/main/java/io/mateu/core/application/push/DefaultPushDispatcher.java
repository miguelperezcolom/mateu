package io.mateu.core.application.push;

import io.mateu.uidl.PushNotifications;
import io.mateu.uidl.push.PushMessage;
import jakarta.inject.Named;
import jakarta.inject.Singleton;

/** What {@link PushNotifications#send} reaches: {@link Push#deliver}. */
@Named
@Singleton
public class DefaultPushDispatcher implements PushNotifications.Dispatcher {

  @Override
  public void send(String principal, PushMessage message) {
    Push.deliver(principal, message);
  }
}
