package io.mateu.explorer.examples.distributed.contentslots;

import io.mateu.uidl.annotations.ContentSlot;
import io.mateu.uidl.annotations.ReadOnly;

/**
 * Two holes for managed content, filled by the content service (the {@code content} remote) while
 * this server builds the view. The news slot is answered at once; the tips slot is answered too late
 * (2 s, past its 500 ms) and paints its FALLBACK. Stop the Java remote and both paint their
 * fallbacks — a slot never blocks the screen, and it does not degrade to the browser asking (unless
 * {@code degradeToClient = true}). Keys are {@code application.screen.name}, checked unique at
 * compile time by the annotation processor.
 */
public class ContentSlots {

  @ReadOnly String screen = "A screen with two content slots";

  @ContentSlot(
      key = "explorer.distributed.news",
      fallback = "No news today (the content service did not answer)",
      timeoutMs = 500,
      description = "The banner at the top of the content-slots example")
  String news;

  @ContentSlot(
      key = "explorer.distributed.tips",
      fallback = "Tip: the content service is slow today — this is the slot's fallback",
      timeoutMs = 500,
      description = "A slot the content service answers too late")
  String tips;
}
