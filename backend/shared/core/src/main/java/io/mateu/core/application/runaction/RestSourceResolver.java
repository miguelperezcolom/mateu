package io.mateu.core.application.runaction;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.data.RestDataSource;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Resolves the DECLARED {@link RestDataSource} of a view for a proxy fetch — from the annotation on
 * the field ({@code @RestOptions}), the class ({@code @RestListing}/{@code @RestData}) or the
 * method ({@code @RestAction}), never from a client-supplied url (so the proxy can't be turned into
 * an open SSRF/secret-exfiltration relay). Used by {@code __restfetch__}.
 */
final class RestSourceResolver {

  private RestSourceResolver() {}

  static RestDataSource resolve(Object instance, String kind, String id) {
    var cls = instance.getClass();
    switch (kind == null ? "" : kind) {
      case "options" -> {
        var field = fieldByName(cls, id);
        var a = field == null ? null : MetaAnnotations.find(field, RestOptions.class);
        return a == null
            ? null
            : RestDataSource.builder()
                .url(a.url())
                .method(a.method())
                .headers(parseHeaders(a.headers()))
                .body(a.body())
                .itemsPath(a.itemsPath())
                .valuePath(a.valuePath())
                .labelPath(a.labelPath())
                .proxy(a.proxy())
                .build();
      }
      case "rows" -> {
        var a = MetaAnnotations.find(cls, RestListing.class);
        return a == null
            ? null
            : RestDataSource.builder()
                .url(a.url())
                .method(a.method())
                .headers(parseHeaders(a.headers()))
                .body(a.body())
                .itemsPath(a.itemsPath())
                .proxy(a.proxy())
                .build();
      }
      case "action" -> {
        var method = methodByName(cls, id);
        var a = method == null ? null : MetaAnnotations.find(method, RestAction.class);
        return a == null
            ? null
            : RestDataSource.builder()
                .url(a.url())
                .method(a.method())
                .headers(parseHeaders(a.headers()))
                .body(a.body())
                .proxy(a.proxy())
                .build();
      }
      case "data" -> {
        var a = MetaAnnotations.find(cls, RestData.class);
        return a == null
            ? null
            : RestDataSource.builder()
                .url(a.url())
                .method(a.method())
                .headers(parseHeaders(a.headers()))
                .body(a.body())
                .proxy(a.proxy())
                .build();
      }
      default -> {
        return null;
      }
    }
  }

  private static Map<String, String> parseHeaders(String[] headers) {
    var map = new LinkedHashMap<String, String>();
    for (String h : headers) {
      int i = h.indexOf(':');
      if (i > 0) {
        map.put(h.substring(0, i).trim(), h.substring(i + 1).trim());
      }
    }
    return map;
  }

  private static Field fieldByName(Class<?> cls, String name) {
    for (var c = cls; c != null && c != Object.class; c = c.getSuperclass()) {
      for (var f : c.getDeclaredFields()) {
        if (f.getName().equals(name)) {
          return f;
        }
      }
    }
    return null;
  }

  private static Method methodByName(Class<?> cls, String name) {
    for (var m : cls.getMethods()) {
      if (m.getName().equals(name)) {
        return m;
      }
    }
    return null;
  }
}
