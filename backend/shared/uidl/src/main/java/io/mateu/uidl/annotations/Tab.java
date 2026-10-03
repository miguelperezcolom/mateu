package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface Tab {

  String value() default "";

  int order() default 0;

  /**
   * Keyboard shortcut that selects this tab, e.g. {@code "alt+1"} or {@code "ctrl+shift+p"}. Same
   * syntax as {@code @Action(shortcut=...)}: {@code +}-separated modifiers ({@code ctrl}, {@code
   * alt}, {@code shift}, {@code meta}) and the key. Empty means no shortcut.
   */
  String shortcut() default "";

  /**
   * When {@code true} this tab is the one selected when its tab strip first renders (instead of the
   * default first tab). If several tabs in the same strip declare {@code open=true}, the first one
   * wins. Independent of {@link #shortcut()}, which only selects the tab on demand.
   */
  boolean open() default false;

  /**
   * The tab's ROUTE KEY: a URL segment that opens it. Selecting the tab appends it to the page's
   * URL ({@code /vcns/7} → {@code /vcns/7/gateways}) as a new history entry, so back/forward walk
   * the tabs and a reload or a pasted link opens this one. Empty means the tab has no URL of its
   * own (it is still selectable, the URL just does not change).
   */
  String key() default "";

  /**
   * A feature flag that must be on for the tab to show ({@code "policy-simulator"}, or {@code
   * "!legacy"} for its negation), answered by the {@link io.mateu.uidl.interfaces.FeatureFlags}
   * beans. Empty means always shown. When the flags leave a single tab, its strip is not drawn —
   * the tab keeps its key and URL, so nothing moves when the flag flips back.
   */
  String show() default "";
}
