package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * A hole for managed content (help texts, notices, editorial blocks) filled by the content service:
 * the field is rendered as a micro frontend the HOST resolves while it builds the view, against the
 * registered remote {@code mateu.content-slots.remote} (default {@code content}), at the route the
 * key names. The developer never writes the url.
 *
 * <p>It never blocks the screen: an empty slot, a content service that is down, slow or answers an
 * error paints {@link #fallback()} — nothing when it is blank. Unlike a plain micro frontend it
 * does not degrade to the renderer asking the remote (content is accessory), unless {@link
 * #degradeToClient()}.
 *
 * <p>The key is a contract with the content service (whose backoffice lists the slots): {@code
 * application.screen.name}, lower case letters, digits and dashes, unique in the application —
 * checked at compile time by the indexer annotation processor, which also writes every slot of the
 * module to {@code META-INF/mateu/content-slots.json}.
 */
@Experimental
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface ContentSlot {

  /** {@code application.screen.name}. Changing it is a contract change. */
  String key();

  /** What is painted when there is no content; blank = the slot is not painted. */
  String fallback() default "";

  /** How long the host waits for the content; 0 = the remote's default. */
  int timeoutMs() default 0;

  /** Optional description for the content editors (the backoffice). */
  String description() default "";

  /**
   * When the content does not arrive in time, let the renderer ask for it instead of the fallback.
   */
  boolean degradeToClient() default false;
}
