package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * An APP-WIDE keyboard shortcut, declared on the app class: active on every screen of the app,
 * listed in the "Keyboard shortcuts" overlay ({@code ?}) and in the command palette. It goes to
 * {@link #route()} or runs the app-level {@link #actionId()} (a method of the app class).
 *
 * <p>{@link #code()} is a QUICK-LAUNCH code: typed in the command palette (⌘K / the command center)
 * and confirmed with Enter, it goes to the same place — the back-office habit of typing "RES" to
 * open reservations.
 *
 * <p>A screen's own {@code @Action(shortcut)} / {@code @Tab(shortcut)} wins over an app shortcut on
 * the same key: the screen handles the key first and the app shortcut stands down.
 *
 * <pre>{@code
 * @App
 * @AppShortcut(key = "f9", route = "/reservations", label = "Reservations", code = "RES")
 * @AppShortcut(key = "alt+g", route = "/guests", label = "Guests", code = "GST")
 * public class Shell { ... }
 * }</pre>
 */
@Experimental("app shortcuts (3.0-alpha, E2 patterns)")
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Repeatable(AppShortcuts.class)
@Documented
public @interface AppShortcut {

  /** The key, in the {@code @Action(shortcut)} syntax: {@code "f9"}, {@code "ctrl+alt+r"}. */
  String key() default "";

  /** Where it goes (relative to the app), e.g. {@code "/reservations"}. */
  String route() default "";

  /** Or: the app-level action it runs (a method of the app class). */
  String actionId() default "";

  /** How it is listed; blank = the route humanized. */
  String label() default "";

  /** The quick-launch code typed in the command palette, e.g. {@code "RES"}; blank = none. */
  String code() default "";
}
