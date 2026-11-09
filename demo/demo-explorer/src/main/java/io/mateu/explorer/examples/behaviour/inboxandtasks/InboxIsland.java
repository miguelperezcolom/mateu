package io.mateu.explorer.examples.behaviour.inboxandtasks;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link InboxDemoApp} (a whole app, with its own header) in the Explorer page. */
public class InboxIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/inbox";
  }
}
