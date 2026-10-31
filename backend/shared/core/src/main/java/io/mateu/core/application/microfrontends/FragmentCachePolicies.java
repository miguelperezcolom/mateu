package io.mateu.core.application.microfrontends;

import io.mateu.dtos.FragmentCacheDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.CacheableFragment;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.FragmentCachePolicy;
import io.mateu.uidl.remote.FragmentCachePolicySupplier;
import java.util.Arrays;
import java.util.List;

/**
 * The REMOTE side of fragment caching: a view loaded by a host that embeds it says, on its answer,
 * whether the host may cache it ({@link FragmentCachePolicySupplier} > {@link CacheableFragment}).
 * When the host already holds the key the view declares ({@value
 * MicroFrontendServerResolver#FRAGMENT_KEYS_HEADER}), the answer goes without its fragments: the
 * host uses its own copy.
 */
public final class FragmentCachePolicies {

  private static final String ROUTE_OWNER = "mateu.microfrontends.routeOwner";

  private FragmentCachePolicies() {}

  /**
   * Remembers the view that handled the route: a {@code RouteHandler} answers with ANOTHER object
   * (the screen for that route), and the policy it declares must not be lost with it.
   */
  public static void rememberRouteOwner(HttpRequest request, Object owner) {
    if (request != null) {
      request.setAttribute(ROUTE_OWNER, owner);
    }
  }

  /** The increment with the cache policy of the first of {@code candidates} declaring one. */
  public static UIIncrementDto stamp(
      UIIncrementDto increment, String actionId, HttpRequest request, Object... candidates) {
    if (increment == null || !isLoad(actionId)) {
      return increment;
    }
    for (var candidate : candidates) {
      var policy = policyOf(candidate, request);
      if (policy != null) {
        return apply(increment, policy, request);
      }
    }
    var owner = request == null ? null : request.getAttribute(ROUTE_OWNER);
    var policy = policyOf(owner, request);
    return policy != null ? apply(increment, policy, request) : increment;
  }

  static UIIncrementDto apply(
      UIIncrementDto increment, FragmentCachePolicy policy, HttpRequest request) {
    var key = policy.key() == null || policy.key().isBlank() ? null : policy.key();
    var dto =
        new FragmentCacheDto(
            Math.max(0, policy.maxAgeSeconds()),
            policy.varyBy() == null ? FragmentCachePolicy.NONE : policy.varyBy(),
            key,
            false);
    if (key != null
        && FragmentCachePolicy.KEY.equalsIgnoreCase(String.valueOf(policy.varyBy()))
        && heldByHost(key, request)) {
      return increment
          .withFragments(List.of())
          .withFragmentCache(new FragmentCacheDto(dto.maxAgeSeconds(), dto.varyBy(), key, true));
    }
    return increment.withFragmentCache(dto);
  }

  private static boolean heldByHost(String key, HttpRequest request) {
    var held =
        request == null
            ? null
            : request.getHeaderValue(MicroFrontendServerResolver.FRAGMENT_KEYS_HEADER);
    return held != null && Arrays.stream(held.split(",")).map(String::trim).anyMatch(key::equals);
  }

  private static FragmentCachePolicy policyOf(Object candidate, HttpRequest request) {
    if (candidate instanceof FragmentCachePolicySupplier supplier) {
      return supplier.fragmentCachePolicy(request);
    }
    if (candidate != null) {
      var annotation = candidate.getClass().getAnnotation(CacheableFragment.class);
      if (annotation != null) {
        return new FragmentCachePolicy(annotation.maxAgeSeconds(), annotation.varyBy(), null);
      }
    }
    return null;
  }

  private static boolean isLoad(String actionId) {
    return actionId == null || actionId.isEmpty() || "__load__".equals(actionId);
  }
}
