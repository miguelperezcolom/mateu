package io.mateu;

import io.mateu.core.infra.security.IdentityResolver;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Singleton;

/** Warns, once at startup, when nothing will authenticate callers (no micronaut-security). */
@Singleton
public class MateuSecurityStartupCheck implements ApplicationEventListener<StartupEvent> {

  @Override
  public void onApplicationEvent(StartupEvent event) {
    IdentityResolver.warnOnStartup(
        IdentityResolver.present("io.micronaut.security.authentication.Authentication"),
        "Add micronaut-security-jwt (or another micronaut-security module)");
  }
}
