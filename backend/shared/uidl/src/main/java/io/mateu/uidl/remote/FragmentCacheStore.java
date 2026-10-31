package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import java.time.Duration;

/**
 * Where the host keeps the fragments remotes declared cacheable (see {@link FragmentCachePolicy}).
 * Keys and values are opaque strings (the value is the fragment's wire JSON), so a distributed
 * store needs no Mateu types. Mateu's own is in memory and bounded; declare a bean of this type to
 * replace it.
 */
@Experimental
public interface FragmentCacheStore {

  /** The value stored under {@code key}, or null when there is none or it expired. */
  String get(String key);

  /** Stores {@code value} under {@code key} for {@code ttl}. */
  void put(String key, String value, Duration ttl);
}
