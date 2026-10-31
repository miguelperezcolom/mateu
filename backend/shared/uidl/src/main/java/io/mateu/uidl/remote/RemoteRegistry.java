package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import java.util.Optional;

/**
 * The remotes the host may call on the user's behalf. Mateu's own registry reads the {@link
 * RemoteCatalogSupplier} beans and the {@code mateu.remotes.*} properties; an application that
 * keeps them elsewhere (a service registry, a database) declares its own bean of this type, which
 * replaces it.
 */
@Experimental
public interface RemoteRegistry {

  /** The remote registered under {@code id}. */
  Optional<RemoteDescriptor> byId(String id);

  /** The registered remote an absolute url belongs to; empty when it belongs to none. */
  Optional<RemoteDescriptor> forUrl(String url);
}
