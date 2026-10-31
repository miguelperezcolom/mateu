package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;

/**
 * A bean that contributes registered remotes (see {@link RemoteDescriptor}). The remotes it returns
 * join the ones configured as properties ({@code mateu.remotes=content,orders} + {@code
 * mateu.remotes.<id>.base-url}, {@code .timeout-ms}, {@code .identity}); a property entry wins over
 * a supplied one with the same id.
 */
@Experimental
public interface RemoteCatalogSupplier {

  List<RemoteDescriptor> remotes();
}
