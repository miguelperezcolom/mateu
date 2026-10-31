package io.mateu.demo.microfrontends;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** A remote that takes 2 s to answer: past the host's budget, so the browser asks it. */
@UI("/remote-slow")
@Title("Slow remote")
public class SlowRemote {

  @ReadOnly String greeting = slowly("Hello from the slow remote");

  private static String slowly(String text) {
    try {
      Thread.sleep(2000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    return text;
  }
}
