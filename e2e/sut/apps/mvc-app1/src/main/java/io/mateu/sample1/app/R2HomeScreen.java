package io.mateu.sample1.app;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The distinct home Screen an R2 multi-screen app points at (coherence-plan #5, App ≠ its Home
 * Screen). Its own routed class — so the app's home fragment is typed with THIS class, not the app.
 */
@UI("/r2home/screen")
@Title("R2 home screen")
public class R2HomeScreen {
  public String note = "R2 home content";
}
