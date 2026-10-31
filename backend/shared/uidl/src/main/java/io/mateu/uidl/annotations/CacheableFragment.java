package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Says that a view other hosts embed (resolving it in their server) may be cached by them, for how
 * long and by what it varies — see {@link io.mateu.uidl.remote.FragmentCachePolicy} for the values
 * of {@link #varyBy()}. The remote decides; a host never caches what its remote did not allow.
 * {@link io.mateu.uidl.remote.FragmentCachePolicySupplier} wins over it.
 */
@Experimental
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface CacheableFragment {

  int maxAgeSeconds();

  /**
   * {@code shared}, {@code user} or {@code none}. A key computed per caller ({@code key}) needs
   * {@link io.mateu.uidl.remote.FragmentCachePolicySupplier}.
   */
  String varyBy() default "user";
}
