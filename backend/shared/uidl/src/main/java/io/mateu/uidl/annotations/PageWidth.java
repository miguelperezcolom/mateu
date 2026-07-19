package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Explicitly sets how the page's content column is sized within the viewport (the first parameter
 * of the Oracle Redwood page templates). When absent, the {@code PageWidthSupplier} hook applies,
 * and otherwise the renderer infers the width from the page content (defaulting to {@code FIXED}).
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface PageWidth {

  /** The page width to paint. */
  PageWidthStyle value();
}
