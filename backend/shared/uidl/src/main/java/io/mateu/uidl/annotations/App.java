package io.mateu.uidl.annotations;

import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppVariant;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface App {
  AppVariant value() default AppVariant.AUTO;

  AppLayout layout() default AppLayout.SINGLE_SLOT;

  boolean themeToggle() default false;

  /**
   * Show the always-present "command center" FAB (the Ask-Oracle pattern): a floating button that
   * opens a full-screen palette unifying navigation (the whole menu), global entity search (when
   * the app implements {@link io.mateu.uidl.interfaces.GlobalSearchSupplier}), recent screens and
   * the AI assistant. Opt-in; also toggled by ⌘K/Ctrl+K.
   */
  boolean commandCenter() default false;

  /**
   * Render the app without its navigation chrome (header, menu/tabs) — content fills the viewport
   * and the only way to move around is the command-center FAB. Implies {@link #commandCenter()}.
   */
  boolean chromeless() default false;
}
