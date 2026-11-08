package io.mateu.explorer.remote.fragments;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.atomic.AtomicInteger;

/** No cache policy (= varyBy none): the host asks every time — the render number grows per load. */
@UI("/mf-uncached")
@Title("Never cached (varyBy = none)")
public class UncachedFragment {

  static final AtomicInteger RENDERS = new AtomicInteger();

  @ReadOnly int render = RENDERS.incrementAndGet();

  @ReadOnly String renderedAt = LocalTime.now().truncatedTo(ChronoUnit.SECONDS).toString();
}
