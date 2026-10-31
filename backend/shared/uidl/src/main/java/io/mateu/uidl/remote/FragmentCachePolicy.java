package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * What a REMOTE declares about caching the fragment it answers with: the remote decides, the host
 * that embeds it only obeys. Travels on the response ({@code UIIncrementDto.fragmentCache}).
 *
 * @param maxAgeSeconds how long the host may reuse it; 0 or less = not cacheable
 * @param varyBy what the fragment differs by, which is what the host keys it by besides its url:
 *     <ul>
 *       <li>{@value #NONE} — never cached;
 *       <li>{@value #SHARED} — the same for every caller;
 *       <li>{@value #USER} — one per caller;
 *       <li>{@value #KEY} — one per {@code key}, an opaque value the remote computes (e.g. the hash
 *           of the user attributes its content is targeted by): callers whose key is the same share
 *           the entry. The host remembers each caller's key for {@code maxAgeSeconds} (no round
 *           trip while it lasts) and, for a caller it does not know yet, tells the remote which
 *           keys it holds ({@code X-Mateu-Fragment-Keys}) so the remote may answer "yours" without
 *           the fragment ({@code UIIncrementDto.fragmentCache.notModified}).
 *     </ul>
 *
 * @param key the opaque key, for {@value #KEY}
 */
@Experimental
@Builder
public record FragmentCachePolicy(int maxAgeSeconds, String varyBy, String key) {

  public static final String NONE = "none";
  public static final String SHARED = "shared";
  public static final String USER = "user";
  public static final String KEY = "key";

  /** Not cacheable. */
  public static FragmentCachePolicy none() {
    return new FragmentCachePolicy(0, NONE, null);
  }

  /** The same for every caller, for {@code maxAgeSeconds}. */
  public static FragmentCachePolicy shared(int maxAgeSeconds) {
    return new FragmentCachePolicy(maxAgeSeconds, SHARED, null);
  }

  /** One per caller, for {@code maxAgeSeconds}. */
  public static FragmentCachePolicy perUser(int maxAgeSeconds) {
    return new FragmentCachePolicy(maxAgeSeconds, USER, null);
  }

  /** One per opaque {@code key} the remote computed for this caller, for {@code maxAgeSeconds}. */
  public static FragmentCachePolicy byKey(String key, int maxAgeSeconds) {
    return new FragmentCachePolicy(maxAgeSeconds, KEY, key);
  }
}
