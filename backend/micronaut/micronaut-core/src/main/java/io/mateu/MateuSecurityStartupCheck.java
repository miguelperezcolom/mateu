package io.mateu;

import io.mateu.core.infra.security.IdentityResolver;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Singleton;

/** Says, once at startup, what the security configuration means for restricted UI. */
@Singleton
public class MateuSecurityStartupCheck implements ApplicationEventListener<StartupEvent> {

  @Override
  public void onApplicationEvent(StartupEvent event) {
    IdentityResolver.warnOnStartup();
  }
}
