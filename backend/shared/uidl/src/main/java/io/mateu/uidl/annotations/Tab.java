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
}
