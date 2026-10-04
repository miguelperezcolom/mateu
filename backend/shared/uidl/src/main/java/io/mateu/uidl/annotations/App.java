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
   * body text, where a brand red loses contrast), the welcome hero's background and the accent
   * strip — where Redwood draws its colour strip: under a page's header, on top of a listing's
   * results, at the foot of the hero. Blank (the default): no accent. Exposed to the page as the
   * {@code --mateu-accent} custom property, which an app's own CSS can also set.
   */
  String accentColor() default "";

  /**
   * The image of the accent strip (see {@link #accentColor()}): a URL, e.g. {@code
   * "/images/strip.svg"}, repeated along the strip — the app's own take on Redwood's colour strip.
   * Blank (the default): the strip is a plain band in the accent colour. Ignored with no accent.
   */
  String accentStrip() default "";

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
}
