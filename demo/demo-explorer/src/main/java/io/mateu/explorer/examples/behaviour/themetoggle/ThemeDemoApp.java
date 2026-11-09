package io.mateu.explorer.examples.behaviour.themetoggle;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * {@code @App(themeToggle = true)} puts a moon/sun button on the header. The choice is kept by the
 * browser ({@code localStorage['mateu-theme']}); without one the OS preference
 * ({@code prefers-color-scheme}) decides. (The Redwood renderer is light only and ignores it.)
 */
@UI("/apps/theme")
@Title("Theme toggle demo")
@App(themeToggle = true)
public class ThemeDemoApp {

  @Menu Sample sample;

  @Title("Dark or light")
  @ReadOnly
  public static class Sample {
    String name = "Ada Lovelace";
    String role = "Analyst";
  }
}
