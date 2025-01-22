package io.mateu.uidl.views;

import java.util.HashMap;
import java.util.Map;

public record ExtraFilters(String ql, Map<String, Object> parameters) {

  public ExtraFilters(String ql, Object... params) {
    this(ql, toMap(params));
  }

  private static Map<String, Object> toMap(Object[] params) {
    Map<String, Object> parameters = new HashMap<>();
    String n = null;
    for (int i = 0; i < params.length; i++) {
      if (i % 2 == 0) n = (String) params[i];
      else parameters.put(n, params[i]);
    }
    return parameters;
  }
}
