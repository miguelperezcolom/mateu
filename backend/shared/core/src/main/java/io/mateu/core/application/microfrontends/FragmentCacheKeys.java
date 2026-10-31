package io.mateu.core.application.microfrontends;

import io.mateu.dtos.FragmentCacheDto;
import io.mateu.uidl.remote.FragmentCachePolicy;
import io.mateu.uidl.security.CallerIdentity;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

/**
 * The keys the host keeps a remote's cacheable fragment under (see {@link FragmentCachePolicy}):
 *
 * <ul>
 *   <li>the RULE of a url (what the remote said it varies by), so the next request knows how to
 *       look before asking anyone;
 *   <li>the ENTRY: url + what it varies by ({@code shared}, the caller, or the remote's opaque
 *       key);
 *   <li>for {@code key}: the MEMO of each caller's key, and the KNOWN keys of the url, offered to
 *       the remote by a caller the host does not know yet.
 * </ul>
 *
 * Every key is hashed: the url and the caller's credentials never sit in a store as they are.
 */
final class FragmentCacheKeys {

  private FragmentCacheKeys() {}

  /** Whether the remote allowed caching at all (and said enough to key it). */
  static boolean cacheable(FragmentCacheDto policy) {
    if (policy == null || policy.maxAgeSeconds() <= 0 || policy.varyBy() == null) {
      return false;
    }
    var vary = normalised(policy.varyBy());
    return FragmentCachePolicy.SHARED.equals(vary)
        || FragmentCachePolicy.USER.equals(vary)
        || (FragmentCachePolicy.KEY.equals(vary)
            && policy.key() != null
            && !policy.key().isBlank());
  }

  static String normalised(String varyBy) {
    return varyBy == null ? "" : varyBy.trim().toLowerCase(Locale.ROOT);
  }

  static String rule(String url) {
    return "mfe-rule:" + sha256(url);
  }

  static String memo(String url, String caller) {
    return "mfe-memo:" + sha256(url + "\n" + caller);
  }

  static String known(String url) {
    return "mfe-keys:" + sha256(url);
  }

  static String entry(String url, String varying) {
    return "mfe:" + sha256(url + "\n" + varying);
  }

  /** What an entry of this vary rule is keyed by for this caller; null when it cannot say. */
  static String varying(String varyBy, String caller, String key) {
    return switch (normalised(varyBy)) {
      case FragmentCachePolicy.SHARED -> "shared";
      case FragmentCachePolicy.USER -> "user:" + caller;
      case FragmentCachePolicy.KEY -> key == null ? null : "key:" + key;
      default -> null;
    };
  }

  /**
   * Who the caller is, for caching: the principal the framework authenticated; without one, the
   * credentials the remote is called with — two callers never share a per-user entry just because
   * neither has a name.
   */
  static String caller(CallerIdentity identity, String authorization) {
    if (identity != null && identity.name() != null && !identity.name().isBlank()) {
      return "user:" + identity.name();
    }
    if (authorization != null && !authorization.isBlank()) {
      return "token:" + sha256(authorization);
    }
    return "anonymous";
  }

  static String sha256(String text) {
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(text.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }
}
