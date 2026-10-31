package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Implemented by a view that is embedded by other hosts (resolved by their server) to say whether
 * they may cache it — the dynamic twin of {@link io.mateu.uidl.annotations.CacheableFragment}, and
 * it wins over it.
 */
@Experimental
public interface FragmentCachePolicySupplier {

  FragmentCachePolicy fragmentCachePolicy(HttpRequest httpRequest);
}
