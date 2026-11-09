package io.mateu.explorer.examples.behaviour.accesskeys;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * {@code @App(accessKeys = true)}: holding Alt shows a key badge next to every visible button and
 * tab — its declared shortcut, else a letter of its label picked automatically — and Alt+that
 * letter presses it. No per-button declaration needed.
 */
@UI("/x/behaviour/access-keys")
@Title("Front desk")
@App(value = AppVariant.MENU_ON_TOP, accessKeys = true)
public class FrontDeskApp {

  @Menu CheckInPage checkIn;
}
