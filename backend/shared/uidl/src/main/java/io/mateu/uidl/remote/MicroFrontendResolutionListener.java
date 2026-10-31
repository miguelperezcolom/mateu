package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;

/**
 * Hears every micro frontend the host resolves (or fails to) — to feed metrics or traces. Mateu
 * already logs each one (logger {@code io.mateu.microfrontends}, INFO); beans of this type are
 * called besides.
 */
@Experimental
public interface MicroFrontendResolutionListener {

  void onResolution(MicroFrontendResolutionEvent event);
}
