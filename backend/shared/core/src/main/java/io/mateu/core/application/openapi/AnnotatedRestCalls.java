package io.mateu.core.application.openapi;

import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceProvenance;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The calls a view class declares through its {@code @Rest*} annotations.
 *
 * <p>The original reader, still needed for the inline case: an endpoint used by exactly one screen
 * is legitimately declared at that screen rather than named in the catalogue. A declaration that
 * DOES name a source carries the name through, so it merges with the catalogue's entry into one
 * operation instead of appearing twice.
 */
final class AnnotatedRestCalls {

  private AnnotatedRestCalls() {}

  static List<RestCall> from(Iterable<Class<?>> views) {
    return from(views, RestSourceCatalog.empty());
  }

  /**
   * @param catalogue consulted for the request of a declaration that only NAMES a source. The URL
   *     lives in the catalogue and the parameter TYPES live on the referencing view, so typing a
   *     referenced call's parameters needs both — neither channel can do it alone.
   */
  static List<RestCall> from(Iterable<Class<?>> views, RestSourceCatalog catalogue) {
    var calls = new ArrayList<RestCall>();
    if (views == null) {
      return calls;
    }
    for (var view : views) {
      if (view != null) {
        collect(view, calls, catalogue == null ? RestSourceCatalog.empty() : catalogue);
      }
    }
    return calls;
  }

  private static void collect(Class<?> view, List<RestCall> calls, RestSourceCatalog catalogue) {
    var name = view.getSimpleName();
    var types = parameterTypes(view);

    var listing = view.getAnnotation(RestListing.class);
    if (listing != null) {
      calls.add(
          call(
              listing.source(),
              listing.url(),
              listing.method(),
              params(types, catalogue, listing.source(), listing.url(), listing.body()),
              RestCall.ResponseShape.items(listing.itemsPath(), "", List.of()),
              name,
              "Listing rows"));
    }
    var data = view.getAnnotation(RestData.class);
    if (data != null) {
      calls.add(
          call(
              data.source(),
              data.url(),
              data.method(),
              params(types, catalogue, data.source(), data.url(), data.body()),
              RestCall.ResponseShape.result(data.resultPath()),
              name,
              "Screen data"));
    }
    for (var field : view.getDeclaredFields()) {
      var options = field.getAnnotation(RestOptions.class);
      if (options != null) {
        var fields = new ArrayList<RestCall.Field>();
        addPath(fields, options.valuePath());
        addPath(fields, options.labelPath());
        calls.add(
            call(
                options.source(),
                options.url(),
                options.method(),
                params(types, catalogue, options.source(), options.url(), options.body()),
                RestCall.ResponseShape.items(options.itemsPath(), "", fields),
                name + "." + field.getName(),
                "Options for a field"));
      }
    }
    for (var method : view.getDeclaredMethods()) {
      var action = method.getAnnotation(RestAction.class);
      if (action != null) {
        calls.add(
            call(
                action.source(),
                action.url(),
                action.method(),
                params(types, catalogue, action.source(), action.url(), action.body()),
                RestCall.ResponseShape.result(action.resultPath()),
                name + "." + method.getName() + "()",
                "Action"));
      }
    }
  }

  private static RestCall call(
      String source,
      String url,
      String method,
      List<RestCall.Param> params,
      RestCall.ResponseShape response,
      String declaredBy,
      String kind) {
    return new RestCall(
        source, url, method, params, response, declaredBy, kind, "", RestSourceProvenance.auto);
  }

  /**
   * The interpolated values a call needs, typed from the view's own fields where possible.
   *
   * <p>They are emitted as required because the screen WILL substitute them, so an endpoint that
   * ignores one cannot answer correctly. The type comes from the field the placeholder names — free
   * accuracy that decides whether a generated server takes a {@code LocalDate} or a {@code String}.
   */
  private static List<RestCall.Param> params(
      Map<String, Class<?>> types,
      RestSourceCatalog catalogue,
      String source,
      String... interpolated) {
    var templates = new ArrayList<String>(List.of(interpolated));
    // A declaration that only names a source has no url of its own to read placeholders off; the
    // referenced entry does. Reading both is what lets a referenced call's parameters be typed from
    // the view that references it — the url lives in the catalogue and the types live on the view,
    // so
    // neither channel can do it alone.
    if (source != null && !source.isBlank()) {
      catalogue
          .get(source)
          .map(entry -> entry.source())
          .ifPresent(
              referenced -> {
                templates.add(referenced.url());
                templates.add(referenced.body());
              });
    }
    var params = new ArrayList<RestCall.Param>();
    for (var name : OpenApiEmitter.placeholders(templates.toArray(new String[0]))) {
      var type = SchemaTypes.of(types.get(name)).asParamType();
      params.add(new RestCall.Param(name, type, true));
    }
    return params;
  }

  /** The view's fields by name, so a {@code ${state.since}} can be typed from {@code since}. */
  private static Map<String, Class<?>> parameterTypes(Class<?> view) {
    var types = new LinkedHashMap<String, Class<?>>();
    for (var c = view; c != null && c != Object.class; c = c.getSuperclass()) {
      for (Field field : c.getDeclaredFields()) {
        types.putIfAbsent(field.getName(), field.getType());
      }
    }
    return types;
  }

  private static void addPath(List<RestCall.Field> fields, String path) {
    if (path != null && !path.isBlank() && fields.stream().noneMatch(f -> f.path().equals(path))) {
      fields.add(new RestCall.Field(path, "string"));
    }
  }
}
