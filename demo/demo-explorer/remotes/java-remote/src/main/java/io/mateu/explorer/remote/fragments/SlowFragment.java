package io.mateu.explorer.remote.fragments;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * A remote that is deliberately slow: it takes {@code SLOW_REMOTE_DELAY_MS} (default 2000 ms) to
 * answer. A host resolving it SERVER side with a smaller budget ({@code timeoutMs = 300}) does not
 * wait: it cancels the call and degrades to CLIENT — the browser asks this remote itself.
 */
@UI("/mf-slow")
@Title("Slow remote")
public class SlowFragment {

  @ReadOnly String greeting = slowly("Hello from the slow remote");

  private static String slowly(String text) {
    try {
      Thread.sleep(Long.parseLong(System.getenv().getOrDefault("SLOW_REMOTE_DELAY_MS", "2000")));
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    return text;
  }
}
