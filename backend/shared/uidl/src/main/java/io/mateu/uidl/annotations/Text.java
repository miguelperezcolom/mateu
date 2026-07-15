package io.mateu.uidl.annotations;

import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.TextSize;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Text {

  TextContainer container() default TextContainer.p;

  /**
   * Font size of the rendered text. {@code m} (the default) applies nothing; the other values
   * enlarge ({@code l}, {@code xl}) or reduce ({@code s}, {@code xs}) the font.
   */
  TextSize size() default TextSize.m;

  /**
   * When {@code true} the rendered container drops its block margins ({@code margin-block-start}
   * and {@code margin-block-end} to 0) — e.g. so a {@code <p>} caption sits tight against its
   * neighbours. Independent of {@link #size()}.
   */
  boolean noMargins() default false;
}
