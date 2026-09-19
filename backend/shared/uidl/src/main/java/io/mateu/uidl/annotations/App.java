package io.mateu.uidl.annotations;

import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppVariant;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface App {
  AppVariant value() default AppVariant.AUTO;

  /**
   * The base path this app is served at (coherence-plan #5): {@code @App(route = "/shop")} declares
   * BOTH that the class is an app AND its route — the single annotation a newcomer reaches for,
   * equivalent to {@code @UI("/shop") @App}. Blank (the default) means the route is carried by a
   * separate {@code @UI} on the same class, exactly as before — so nothing that exists today
   * changes. When both are present and non-blank, {@code @App(route)} wins.
   */
  String route() default "";

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

  /**
   * Extra capability tokens this app REQUIRES from whatever renderer/shell hosts it, on top of the
   * ones derived automatically from the app's metadata. A host embedding the app checks it provides
   * all of them and reports what is missing instead of rendering a broken screen — compatibility by
   * capability, not by version. Use the {@link io.mateu.uidl.Capabilities} vocabulary (or a token a
   * custom renderer understands) for anything the automatic derivation cannot see.
   */
  String[] requires() default {};
}
