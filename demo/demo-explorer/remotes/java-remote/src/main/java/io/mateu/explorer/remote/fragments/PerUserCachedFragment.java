package io.mateu.explorer.remote.fragments;

import io.mateu.uidl.annotations.CacheableFragment;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * {@code varyBy = "user"}: the host keeps one copy PER CALLER (its identity hashed), so two users
 * never see each other's answer. An anonymous caller is never cached.
 */
@UI("/mf-cached-user")
@Title("Cached per user (varyBy = user)")
@CacheableFragment(maxAgeSeconds = 30, varyBy = "user")
public class PerUserCachedFragment {

  static final AtomicInteger RENDERS = new AtomicInteger();

  @ReadOnly int render = RENDERS.incrementAndGet();

  @ReadOnly String renderedAt = LocalTime.now().truncatedTo(ChronoUnit.SECONDS).toString();
}
