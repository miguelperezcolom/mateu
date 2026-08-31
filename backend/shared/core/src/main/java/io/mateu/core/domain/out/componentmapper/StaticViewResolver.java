package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.StaticView;

/**
 * Whether a view is declared {@code @StaticView} — its full response never varies, so the client
 * may cache it for the session and skip the round-trip on return visits (the last step of the
 * client structure cache). Read reflectively like {@code @Compact}/{@code @Toc}, so composed
 * (semantic) annotations that wrap {@code @StaticView} are honored.
 */
public final class StaticViewResolver {

  private StaticViewResolver() {}

  public static boolean isStatic(Object instance) {
    return instance != null && MetaAnnotations.isPresent(instance.getClass(), StaticView.class);
  }
}
