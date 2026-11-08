package io.mateu.explorer.remote.fragments;

import io.mateu.uidl.annotations.CacheableFragment;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * The REMOTE decides whether a host may cache what it answers: {@code varyBy = "shared"} — the same
 * answer for everybody, for 30 s. A host resolving it SERVER side keeps the answer and reuses it:
 * reload the Explorer page and the render number stays put until the 30 s are up.
 */
@UI("/mf-cached-shared")
@Title("Cached for everybody (varyBy = shared)")
@CacheableFragment(maxAgeSeconds = 30, varyBy = "shared")
public class SharedCachedFragment {

  static final AtomicInteger RENDERS = new AtomicInteger();

  @ReadOnly int render = RENDERS.incrementAndGet();

  @ReadOnly String renderedAt = LocalTime.now().truncatedTo(ChronoUnit.SECONDS).toString();
}
