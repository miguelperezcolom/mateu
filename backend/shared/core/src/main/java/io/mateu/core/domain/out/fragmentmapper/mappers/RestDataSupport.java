package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.data.RestAction;
import io.mateu.uidl.data.RestDataSource;
import java.util.LinkedHashMap;

/**
 * Shared bits of the {@code @RestData} screen-data surface: it advertises a synthetic {@code
 * __restdata__} action carrying the client-side REST descriptor ({@link ActionMapper}) plus an
 * {@code OnLoad} trigger that fires it ({@link TriggerMapper}), so the initial data is fetched
 * client-side and merged into the form state — reusing the {@code @RestAction} fetch+merge path.
 */
final class RestDataSupport {

  static final String RESTDATA_ACTION_ID = "__restdata__";

  /**
   * The reserved action a proxy-mode source dispatches: the renderer POSTs it with {@code
   * _sourceKind}/{@code _sourceId} + the component state, and {@link
   * io.mateu.core.application.runaction.RunActionUseCase} resolves the DECLARED source, injects
   * {@code ${secret.X}} and fetches server-side. Value must match {@code RunActionUseCase}'s.
   */
  static final String RESTFETCH_ACTION_ID = "__restfetch__";

  private RestDataSupport() {}

  /**
   * True when the view declares at least one proxy-mode REST source: {@code proxy = true} on a
   * field {@code @RestOptions}, a method {@code @RestAction}, the class
   * {@code @RestListing}/{@code @RestData}, or on anything a {@link
   * io.mateu.uidl.interfaces.RestSourceSupplier} view declares at runtime. Gates advertising the
   * {@code __restfetch__} action so only proxy views carry it.
   */
  static boolean hasProxySource(Object instance) {
    if (instance instanceof io.mateu.uidl.interfaces.RestSourceSupplier supplier) {
      var declarations = supplier.declaredRestSources();
      if (declarations != null
          && declarations.stream()
              .anyMatch(d -> d != null && d.source() != null && d.source().proxy())) {
        return true;
      }
    }
    var cls = instance.getClass();
    var listing = MetaAnnotations.find(cls, RestListing.class);
    if (listing != null && listing.proxy()) {
      return true;
    }
    var data = MetaAnnotations.find(cls, RestData.class);
    if (data != null && data.proxy()) {
      return true;
    }
    for (var c = cls; c != null && c != Object.class; c = c.getSuperclass()) {
      for (var f : c.getDeclaredFields()) {
        var a = MetaAnnotations.find(f, RestOptions.class);
        if (a != null && a.proxy()) {
          return true;
        }
      }
    }
    for (var m : cls.getMethods()) {
      var a = MetaAnnotations.find(m, io.mateu.uidl.annotations.RestAction.class);
      if (a != null && a.proxy()) {
        return true;
      }
    }
    return false;
  }

  /**
   * The client-side REST descriptor for a {@code @RestData} screen (silent load, so no message).
   */
  static RestAction restActionOf(RestData a) {
    var headers = new LinkedHashMap<String, String>();
    for (String h : a.headers()) {
      int i = h.indexOf(':');
      if (i > 0) {
        headers.put(h.substring(0, i).trim(), h.substring(i + 1).trim());
      }
    }
    var source =
        RestDataSource.builder()
            .ref(a.source())
            .url(a.url())
            .method(a.method())
            .headers(headers)
            .body(a.body())
            .proxy(a.proxy())
            .build();
    // resultPath stays as declared: blank means "merge the whole response object" (getByPath with
    // an empty path is identity on the frontend), a path narrows to that sub-object.
    return new RestAction(source, null, a.resultPath());
  }
}
