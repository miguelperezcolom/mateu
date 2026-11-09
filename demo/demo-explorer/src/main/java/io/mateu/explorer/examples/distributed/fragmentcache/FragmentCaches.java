package io.mateu.explorer.examples.distributed.fragmentcache;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.caption;
import static io.mateu.explorer.examples.distributed.Links.column;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Resolve;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Three SERVER micro frontends whose remotes declare different cache policies. The REMOTE decides
 * ({@code @CacheableFragment} / {@code FragmentCachePolicySupplier}); this host only honours it, in
 * its {@code FragmentCacheStore} (in memory by default). Each remote counts its renders — reload
 * this page: the uncached number grows on every load, the shared one stays put for 30 s.
 */
public class FragmentCaches implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        caption("varyBy = none (no policy) — asked on every load"),
        boxed(server("/mf-uncached")),
        caption("varyBy = shared, 30 s — one copy for everybody"),
        boxed(server("/mf-cached-shared")),
        caption("varyBy = user, 30 s — one copy per caller (an anonymous caller is not cached)"),
        boxed(server("/mf-cached-user")));
  }

  private static MicroFrontend server(String mount) {
    return MicroFrontend.builder()
        .baseUrl(Remotes.java() + mount)
        .route("")
        .consumedRoute("_empty")
        .resolve(Resolve.SERVER)
        .build();
  }
}
