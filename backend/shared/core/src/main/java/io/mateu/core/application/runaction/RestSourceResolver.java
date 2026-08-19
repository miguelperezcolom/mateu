package io.mateu.core.application.runaction;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceKind;
import io.mateu.uidl.interfaces.RestSourceSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Resolves the DECLARED {@link RestDataSource} of a view for a proxy fetch — from the annotation on
 * the field ({@code @RestOptions}), the class ({@code @RestListing}/{@code @RestData}) or the
 * method ({@code @RestAction}), or from what a {@link RestSourceSupplier} view declares at runtime,
 * never from a client-supplied url (so the proxy can't be turned into an open SSRF/secret-
 * exfiltration relay). Used by {@code __restfetch__}.
 */
final class RestSourceResolver {

  private RestSourceResolver() {}

  /**
   * The declared descriptor for a proxy fetch, with a catalogue reference already resolved.
   *
   * <p>Resolving HERE rather than at the call site is what keeps the proxy's guarantee intact: the
   * endpoint it ends up calling comes from what the SERVER holds — an annotation, a supplier, or
   * the catalogue — and never from the request. A reference the catalogue does not carry resolves
   * to nothing rather than to a client-supplied url.
   */
  static RestDataSource resolve(
      Object instance, String kind, String id, RestSourceCatalog catalog) {
    return againstCatalog(declaredBy(instance, kind, id), catalog);
  }

  /**
   * Fills a reference in from the catalogue. A descriptor that names no source is returned
   * untouched, so inline declarations are unaffected.
   */
  private static RestDataSource againstCatalog(RestDataSource declared, RestSourceCatalog catalog) {
    if (declared == null || !declared.isReference()) {
      return declared;
    }
    var entry =
        catalog == null
            ? java.util.Optional.<io.mateu.uidl.data.RestSourceEntry>empty()
            : catalog.get(declared.ref());
    return entry.map(declared::resolvedAgainst).orElse(declared);
  }

  private static RestDataSource declaredBy(Object instance, String kind, String id) {
    var declared = declaredBySupplier(instance, kind, id);
    if (declared != null) {
      return declared;
    }
    var cls = instance.getClass();
    switch (kind == null ? "" : kind) {
      case "options" -> {
        var field = fieldByName(cls, id);
        var a = field == null ? null : MetaAnnotations.find(field, RestOptions.class);
        return a == null
            ? null
            : RestDataSource.builder()
                .ref(a.source())
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
                .ref(a.source())
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
                .ref(a.source())
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
                .ref(a.source())
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

  /**
   * What a {@link RestSourceSupplier} view says it declared for this kind and id, or null when the
   * view is not one or declares nothing matching. Asked first: a view that builds its sources at
   * runtime has no annotation for the reflective lookups below to find.
   */
  private static RestDataSource declaredBySupplier(Object instance, String kind, String id) {
    if (!(instance instanceof RestSourceSupplier supplier)) {
      return null;
    }
    var wanted = RestSourceKind.fromWire(kind);
    if (wanted == null) {
      return null;
    }
    var declarations = supplier.declaredRestSources();
    if (declarations == null) {
      return null;
    }
    var wantedId = id == null ? "" : id;
    return declarations.stream()
        .filter(d -> d != null && d.source() != null && wanted.equals(d.kind()))
        // ROWS and DATA have one per view, so an id is not part of what identifies them.
        .filter(
            d ->
                wanted == RestSourceKind.ROWS
                    || wanted == RestSourceKind.DATA
                    || wantedId.equals(d.id()))
        .map(io.mateu.uidl.data.DeclaredRestSource::source)
        .findFirst()
        .orElse(null);
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
