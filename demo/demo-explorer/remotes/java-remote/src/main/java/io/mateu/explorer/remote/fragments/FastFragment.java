package io.mateu.explorer.remote.fragments;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/**
 * A remote that answers at once. Resolved SERVER side, the host embeds this answer in its own page
 * response (first paint, no extra round trip); resolved CLIENT side, the browser asks for it after
 * the page arrives. Either way "Like" is an action of the REMOTE: the browser sends it here.
 */
@UI("/mf-fast")
@Title("Fast remote")
public class FastFragment {

  @ReadOnly String renderedAt = LocalTime.now().truncatedTo(ChronoUnit.SECONDS).toString();

  @ReadOnly int likes;

  @Button
  public void like() {
    likes++;
  }
}
