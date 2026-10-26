package io.mateu.uidl.annotations;

import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppVariant;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Makes a {@code @UI} class an APPLICATION: the shell (header, menu, navigation chrome) around the
 * screens its {@link Menu} fields reach, instead of a single page.
 *
 * <pre>{@code
 * @UI("")
 * @App(themeToggle = true)
 * public class BackOffice {
 *   @Menu Customers customers;
 *   @Menu Orders orders;
 * }
 * }</pre>
 *
 * <p>{@link #value()} picks the navigation chrome; {@link AppVariant#AUTO} (the default) chooses it
 * from the menu's shape (tabs, menu on top, hamburger or tiles). Everything else is opt-in.
 *
 * @see Menu
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Documented
public @interface App {
  /**
   * The navigation chrome. {@link AppVariant#AUTO} (the default): a deep menu shows tiles, more
   * than 7 top-level entries a hamburger menu, fewer a menu on top, and no menu entries at all
   * tabs.
   */
  AppVariant value() default AppVariant.AUTO;

  /**
   * The base path this app is served at (coherence-plan #5): {@code @App(route = "/shop")} declares
   * BOTH that the class is an app AND its route — the single annotation a newcomer reaches for,
   * equivalent to {@code @UI("/shop") @App}. Blank (the default) means the route is carried by a
   * separate {@code @UI} on the same class, exactly as before — so nothing that exists today
   * changes. When both are present and non-blank, {@code @App(route)} wins.
   */
  String route() default "";

  /**
   * How the content area is arranged: one slot (the default) or {@link AppLayout#SPLIT} panes.
   * Independent of the navigation chrome ({@link #value()}).
   */
  AppLayout layout() default AppLayout.SINGLE_SLOT;

  /** Shows a light/dark theme toggle in the app header. Ignored by the light-only Redwood shell. */
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
   * Keyboard ACCESS KEYS (back-office suites' "hold the key to see the keys"): holding Alt shows a
   * key next to every visible button and tab — the declared shortcut when there is one, otherwise a
   * letter of its label assigned automatically — and Alt+that letter activates it. Opt-in.
   */
  @Experimental("access keys (3.0-alpha.409)")
  boolean accessKeys() default false;

  /**
   * "Open on mobile": an app header action that shows the QR code a phone scans to add this UI to
   * the Mateu mobile app — {@code https://mateu.io/add?u=<base URL>&r=<current route>}, a universal
   * link that opens the app when it is installed. On a phone the dialog offers the link itself
   * instead. The QR carries no secret, only where the UI lives; credentials are entered at login.
   * Pair it with {@link MobileApp} for the name, icon and identity provider the app shows. Opt-in.
   */
  @Experimental("mobile app (3.0 beta)")
  boolean mobileQr() default false;

  /**
   * The label of the shell's own "ask" FAB — the always-present button that opens the destination
   * search (the Ask-Oracle pattern). It is the button's accessible name, its tooltip and the title
   * of the palette it opens. Blank (the default) keeps the renderer's own brand: on Redwood, "Ask
   * Oracle". Set it to put the app's brand there instead, e.g. {@code askLabel = "Ask RIU"}.
   */
  String askLabel() default "";

  /**
   * The icon of the shell's own "ask" FAB, for an app that does not want the renderer's brand on
   * it. Blank (the default) keeps the renderer's glyph: on Redwood, the Oracle "O" that Fusion's
   * Ask Oracle carries. Otherwise one of:
   *
   * <ul>
   *   <li>an initial — one or two characters, e.g. {@code "R"} — drawn as a letter on the FAB;
   *   <li>an image — a path relative to the app (like {@link Logo}, e.g. {@code "/images/riu.svg"})
   *       or an absolute/data url;
   *   <li>an icon — a Redwood icon-font class ({@code "oj-ux-ico-…"}) or a Mateu icon name ({@code
   *       "vaadin:…"}).
   * </ul>
   */
  String askIcon() default "";

  /**
   * The app's brand accent — a CSS colour, e.g. {@code "#D2232A"}. It is NOT the theme's primary
   * colour: primary means "you can click this", the accent only says whose app this is. The Vaadin
   * shell uses it for the console name in the section band (light theme only — in dark it stays
   * body text, where a brand red loses contrast), the welcome hero's background and the Section
   * dash, the short rule under every section title — which is where a custom Redwood theme puts its
   * accent colour. It draws no colour strip: Redwood removes its strip as soon as an app brings its
   * own brand. Blank (the default): no accent (the dash takes the primary colour). Exposed to the
   * page as the {@code --mateu-accent} custom property, which an app's own CSS can also set.
   */
  String accentColor() default "";

  /**
   * Ignored. The accent strip was the Vaadin shell's take on Redwood's colour strip, but Redwood
   * removes that strip as soon as an app brings its own brand (Redwood Cobranding: "visual elements
   * like the strip and data textures are removed to avoid conflicting branding"), so no renderer
   * draws one any more; the app's accent goes to the Section dash instead (see {@link
   * #accentColor()}).
   *
   * @deprecated no effect, and no replacement: remove it — the accent goes to the Section dash
   *     through {@link #accentColor()}.
   */
  @Deprecated(since = "3.0-beta.15", forRemoval = true)
  String accentStrip() default "";

  /**
   * Ignored, like {@link #accentStrip()}: Mateu no longer draws an accent strip.
   *
   * @deprecated no effect, and no replacement: remove it — the accent goes to the Section dash
   *     through {@link #accentColor()}.
   */
  @Deprecated(since = "3.0-beta.15", forRemoval = true)
  int accentStripSeed() default 7;

  /**
   * Extra capability tokens this app REQUIRES from whatever renderer/shell hosts it, on top of the
   * ones derived automatically from the app's metadata. A host embedding the app checks it provides
   * all of them and reports what is missing instead of rendering a broken screen — compatibility by
   * capability, not by version. Use the {@link io.mateu.uidl.Capabilities} vocabulary (or a token a
   * custom renderer understands) for anything the automatic derivation cannot see.
   */
  String[] requires() default {};

  /**
   * The way back up from this app (decision D3): {@link BackLink#BREADCRUMBS} (the default) keeps
   * the automatic trail; {@link BackLink#PARENT} draws a single "← Parent" link — labelled with the
   * title of the nearest route above this one ({@code /customers} for a record master at {@code
   * /customers/7}) — and drops the trail on the pages inside it.
   */
  BackLink backLink() default BackLink.BREADCRUMBS;

  /**
   * LIVE UPDATES: every browser running the app keeps one event stream open (shared by its tabs)
   * through which the server pushes header-value changes to every session — {@code
   * LiveHeaderValues.publish("businessDate", "13 Oct")} after the nightly close. Opt-in: without it
   * a header value only changes through {@code UICommand.updateHeaderValue} in the browser that ran
   * the action.
   */
  @Experimental("live header values (3.0-alpha, E2 patterns)")
  boolean liveUpdates() default false;

  /**
   * IDLE-SESSION WARNING: after this many minutes without any activity (keyboard, pointer, scroll —
   * in ANY tab of the app) a modal warns that the session is about to end and counts down {@link
   * #idleWarningSeconds()}; "Stay signed in" runs the app-level {@code _keep-alive} action (hook it
   * with {@link io.mateu.uidl.interfaces.KeepAliveHandler}), "Sign out" — or the countdown reaching
   * zero — goes to {@link #idleSignOutUrl()}. 0 (the default): off.
   */
  @Experimental("idle-session warning (3.0-alpha, E2 patterns)")
  int idleTimeoutMinutes() default 0;

  /** How long the idle warning counts down before signing out. Default 60 seconds. */
  @Experimental("idle-session warning (3.0-alpha, E2 patterns)")
  int idleWarningSeconds() default 60;

  /**
   * Where "Sign out" goes — a full page load, typically the app's logout endpoint (Mateu does no
   * authentication). Blank: the app's logout url when it has one, else the app's root.
   */
  @Experimental("idle-session warning (3.0-alpha, E2 patterns)")
  String idleSignOutUrl() default "";
}
