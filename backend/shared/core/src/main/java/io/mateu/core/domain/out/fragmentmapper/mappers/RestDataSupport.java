package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.uidl.annotations.RestData;
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

  private RestDataSupport() {}

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
            .url(a.url())
            .method(a.method())
            .headers(headers)
            .body(a.body())
            .build();
    // resultPath stays as declared: blank means "merge the whole response object" (getByPath with
    // an empty path is identity on the frontend), a path narrows to that sub-object.
    return new RestAction(source, null, a.resultPath());
  }
}
