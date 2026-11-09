package io.mateu.explorer.examples.components.embeddedview;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/**
 * A plain reflected form — the kind of view the islands on this page embed. Returning {@code this}
 * from an action sends the island its new state.
 */
@Title("Visitor counter")
public class Visitors {

  @ReadOnly int inside = 112;

  @Button
  Visitors arrive() {
    inside++;
    return this;
  }

  @Button
  Visitors leave() {
    inside = Math.max(0, inside - 1);
    return this;
  }
}
