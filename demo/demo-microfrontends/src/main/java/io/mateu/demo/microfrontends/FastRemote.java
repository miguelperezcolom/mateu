package io.mateu.demo.microfrontends;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * A remote that answers at once: the host embeds it. "Like" is an action of the REMOTE — it goes
 * here, never through the host.
 */
@UI("/remote-fast")
@Title("Fast remote")
public class FastRemote {

  @ReadOnly String greeting = "Hello from the fast remote";

  int likes;

  @Button
  public void like() {
    likes++;
  }
}
