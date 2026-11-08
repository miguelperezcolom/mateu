package io.mateu.explorer.examples.behaviour.permissions;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link PermissionsDemoApp} — its header carries the role switcher. */
public class RoleSwitcher extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/permissions";
  }
}
