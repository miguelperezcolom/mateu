package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

public enum Direction {
  ascending,
  descending;

  /**
   * The direction a client spelled: {@code ascending}/{@code descending} or the URL's short {@code
   * asc}/{@code desc}, any case; anything else (or nothing) is ascending. A sort read off a URL
   * ({@code ?sort=name:asc}) used to fail the whole search with a generic error.
   */
  @Experimental("sort direction parsing (3.0 beta)")
  public static Direction parse(Object value) {
    if (value == null) {
      return ascending;
    }
    var text = value.toString().trim().toLowerCase(java.util.Locale.ROOT);
    return text.equals("desc") || text.equals("descending") ? descending : ascending;
  }
}
