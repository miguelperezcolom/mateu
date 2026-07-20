package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Explicitly sets the page's coarse template type (the Oracle Redwood page-template families). When
 * absent, Mateu infers the type from the ModelView's shape; archetypes declare theirs through the
 * type mapping in {@code PageTypeResolver}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface PageTemplate {

  /** The page type to declare. */
  PageType value();
}
