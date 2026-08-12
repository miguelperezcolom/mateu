package io.mateu.core.application.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.infra.HeadlessHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Routes;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteTable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;

/**
 * Build-time exporter of a Mateu app's declared screens into a STATIC BUNDLE: for each route it
 * renders the initial load (the same {@code actionId=""} increment the server returns) and
 * serializes it to wire JSON. A static host can then serve the bundle and the frontend's "bundle
 * mode" answers route loads from it with no backend (data still comes from external endpoints;
 * actions still need a backend — see the frontend's bundle mode).
 *
 * <p>Spring-free by design: it takes an already-built {@link MateuService}, so it is trivially
 * unit-testable (via the core test harness) and reusable from a Maven plugin, a CLI or an endpoint.
 * A route whose initial load throws (needs a live DB, an unscannable bean) is captured as a skipped
 * entry — never fatal — so it simply stays backend-served.
 */
@Slf4j
public final class MateuBundleExporter {

  /**
   * One route's export result. {@code json} is null when skipped ({@code ok=false}). For a {@code
   * :param} route bundled as a TEMPLATE, {@code routePattern} is a regex over the sync path with
   * one capture group per param and {@code paramNames} lists the param names in order — the client
   * matches a concrete path (e.g. {@code orders/42}) against the pattern, extracts the params and
   * feeds them to the pre-rendered structure (client-side data fetch resolves {@code
   * ${state.<p>}}). Both are null for a plain (non-template) entry.
   */
  public record BundleEntry(
      String route,
      String syncPath,
      String json,
      boolean ok,
      String skipReason,
      String routePattern,
      List<String> paramNames) {
    /** Plain (non-template) entry. */
    public BundleEntry(String route, String syncPath, String json, boolean ok, String skipReason) {
      this(route, syncPath, json, ok, skipReason, null, null);
    }
  }

  /**
   * The whole bundle: metadata, one entry per requested route, and the mount's authored route
   * registry.
   *
   * @param routes the entries from {@code specs/ui/routes.yaml}. They travel with the bundle
   *     because in a statically deployed mount there is no server left to ask what a URL means —
   *     the renderer has to resolve it from shipped data. Only the AUTHORED half is shipped: the
   *     derived half is route→class, and a class is exactly what a bundle with no backend cannot
   *     use.
   */
  public record BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes) {

    /** Pre-registry shape, kept so existing callers and golden files are unaffected. */
    public BundleManifest(
        String baseUrl, String generatedAt, boolean staticOnly, List<BundleEntry> entries) {
      this(baseUrl, generatedAt, staticOnly, entries, RouteTable.empty());
    }
  }

  /** A {@code :name} route segment (the param marker). */
  private static final java.util.regex.Pattern PARAM_SEGMENT =
      java.util.regex.Pattern.compile(":([^/]+)");

  /**
   * Placeholder substituted for each param when rendering a template's param-independent structure.
   */
  private static final String PARAM_PLACEHOLDER = "__mateu_param__";

  private final MateuService service;
  private final ObjectMapper wireMapper;
  private final Supplier<HttpRequest> requestFactory;

  public MateuBundleExporter(MateuService service) {
    this(service, defaultWireMapper(), null);
  }

  public MateuBundleExporter(
      MateuService service, ObjectMapper wireMapper, Supplier<HttpRequest> requestFactory) {
    this.service = service;
    this.wireMapper = wireMapper != null ? wireMapper : defaultWireMapper();
    this.requestFactory = requestFactory;
  }

  /**
   * Render every declared route, discovered from BOTH sources so it works in any module layout:
   *
   * <ul>
   *   <li>the live {@link RouteResolver} and {@link RoutedClassProvider} beans (via {@link
   *       MateuBeanProvider}) — the framework's annotation processor generates a {@code
   *       RouteResolver} for a pathed {@code @UI("/x")} (route in its patterns) and a {@code
   *       RoutedClassProvider} for a root {@code @UI("")}/{@code @Route}/{@code @HomeRoute} (route
   *       read off the class's routing annotations). This is the RUNTIME source (the bundle
   *       endpoint) and covers single-module apps where {@code @UI} lives in the app;
   *   <li>the classloader's compiled route index ({@code META-INF/mateu/*-registrations}) — written
   *       only by the indexer AP (two-module setup), the BUILD-TIME source used by the Maven goal
   *       from a fresh context with no live beans.
   * </ul>
   *
   * {@code :param} routes are skipped when {@code staticOnly}. The one-call entry point shared by
   * the build-time Maven goal and the runtime bundle endpoint.
   */
  public BundleManifest exportAll(String baseUrl, ClassLoader cl, boolean staticOnly) {
    return exportAll(baseUrl, cl, staticOnly, false);
  }

  /**
   * As {@link #exportAll(String, ClassLoader, boolean)}, but when {@code includeParamRoutes} a
   * {@code :param} route is bundled as a TEMPLATE (rendered once with a placeholder param) instead
   * of being skipped — see {@link #exportTemplate}. The client matches a concrete path against the
   * template's pattern and feeds the extracted params to the pre-rendered structure.
   */
  public BundleManifest exportAll(
      String baseUrl, ClassLoader cl, boolean staticOnly, boolean includeParamRoutes) {
    // collect param routes too when templating them; otherwise keep the static-only filter
    boolean onlyStatic = staticOnly && !includeParamRoutes;
    var routes = new LinkedHashSet<>(routesFromBeans(onlyStatic));
    RouteRegistrations.read(cl).stream()
        .map(RouteRegistrations.RouteRef::route)
        .filter(r -> !onlyStatic || RouteRegistrations.isStatic(r))
        .forEach(routes::add);
    // Routes that exist ONLY in routes.yaml would otherwise never be exported: they have no
    // annotation and therefore no index entry and no bean. A registry entry with no view model is
    // skipped here on purpose — there is nothing on the server to pre-render for it, and the
    // renderer builds it from the shipped table plus its definition.
    var authored = new RouteRegistry().authoredFrom(cl);
    authored.routes().stream()
        .filter(entry -> entry.viewModel() != null && !entry.viewModel().isBlank())
        .map(entry -> "/" + entry.route())
        .filter(r -> !onlyStatic || RouteRegistrations.isStatic(r))
        .forEach(routes::add);
    var entries = new ArrayList<BundleEntry>();
    for (String route : routes) {
      entries.add(
          RouteRegistrations.isStatic(route)
              ? exportRoute(baseUrl, route)
              : exportTemplate(baseUrl, route));
    }
    return new BundleManifest(
        baseUrl, java.time.Instant.now().toString(), onlyStatic, entries, authored);
  }

  /**
   * Routes declared by the live {@link RouteResolver} and {@link RoutedClassProvider} beans. Empty
   * (never throws) when no bean context is wired — e.g. the Maven goal's fresh context — so the
   * caller falls back to the index.
   */
  private List<String> routesFromBeans(boolean staticOnly) {
    var out = new ArrayList<String>();
    try {
      // Pathed @UI("/x") → a RouteResolver carrying the route in its compiled patterns.
      var resolvers = MateuBeanProvider.getBeans(RouteResolver.class);
      if (resolvers != null) {
        for (RouteResolver rr : resolvers) {
          for (var pattern : rr.supportedRoutesPatterns()) {
            addRoute(out, pattern.route(), staticOnly);
          }
        }
      }
      // Root @UI("") / @Route / @HomeRoute → a RoutedClassProvider; the route lives on the class's
      // routing annotations (a blank @UI("") is the valid root route).
      var providers = MateuBeanProvider.getBeans(RoutedClassProvider.class);
      if (providers != null) {
        for (RoutedClassProvider p : providers) {
          for (String r : routesOf(p.routedClass())) {
            addRoute(out, r, staticOnly);
          }
        }
      }
    } catch (Throwable t) {
      log.debug("route discovery from beans failed (falling back to the index): {}", t.toString());
    }
    return out;
  }

  private static void addRoute(List<String> out, String r, boolean staticOnly) {
    // route "" (root) is valid and kept; a null route is not
    if (r != null && (!staticOnly || RouteRegistrations.isStatic(r))) {
      out.add(r);
    }
  }

  /**
   * The route(s) declared by a routed class's routing annotations ({@code @UI}, {@code @Route},
   * {@code @Routes}, {@code @HomeRoute}). Read directly (routing annotations are NOT
   * meta-annotation composable — the AP resolves them at compile time).
   */
  private static List<String> routesOf(Class<?> c) {
    var routes = new ArrayList<String>();
    var ui = c.getAnnotation(UI.class);
    if (ui != null) {
      routes.add(ui.value());
    }
    var route = c.getAnnotation(Route.class);
    if (route != null) {
      routes.add(route.value());
    }
    var routesAnn = c.getAnnotation(Routes.class);
    if (routesAnn != null) {
      for (Route r : routesAnn.value()) {
        routes.add(r.value());
      }
    }
    if (c.getAnnotation(HomeRoute.class) != null) {
      routes.add("");
    }
    return routes;
  }

  /** Render every route; per-route failure is captured, never thrown. */
  public BundleManifest export(String baseUrl, List<String> routes) {
    var entries = new ArrayList<BundleEntry>();
    for (String route : routes) {
      entries.add(exportRoute(baseUrl, route));
    }
    return new BundleManifest(baseUrl, java.time.Instant.now().toString(), true, entries);
  }

  /** Render a single route's initial load; a skip (throw / empty) yields {@code ok=false}. */
  public BundleEntry exportRoute(String baseUrl, String route) {
    var syncPath = toSyncPath(route);
    try {
      var rq = RunActionRqDto.builder().route(route).actionId("").build();
      var httpRequest =
          requestFactory != null
              ? requestFactory.get()
              : new HeadlessHttpRequest(rq)
                  .withAttribute("baseUrl", baseUrl == null ? "" : baseUrl);
      // A custom requestFactory may not carry the rq/baseUrl — the HeadlessHttpRequest default
      // does.
      var increment =
          service.runAction("", rq, baseUrl == null ? "" : baseUrl, httpRequest).blockFirst();
      if (increment == null) {
        return new BundleEntry(route, syncPath, null, false, "empty increment");
      }
      // A load that failed server-side does NOT throw — RunActionUseCase.onErrorResume maps it to
      // an
      // increment carrying an error message and NO fragments. A renderable screen always has at
      // least
      // one fragment, so treat "no fragments" as a skip (the route stays backend-served), surfacing
      // the error message as the reason.
      if (increment.fragments() == null || increment.fragments().isEmpty()) {
        var reason =
            increment.messages() != null && !increment.messages().isEmpty()
                ? increment.messages().get(0).text()
                : "no fragments";
        return new BundleEntry(route, syncPath, null, false, reason);
      }
      return new BundleEntry(route, syncPath, wireMapper.writeValueAsString(increment), true, null);
    } catch (Throwable t) {
      log.warn("skipping route {} (export failed): {}", route, t.toString());
      return new BundleEntry(route, syncPath, null, false, t.toString());
    }
  }

  /**
   * Bundle a {@code :param} route as a TEMPLATE: render its structure ONCE with a placeholder for
   * each param (so the increment is param-independent — a serverless detail screen whose data is
   * fetched CLIENT-SIDE via {@code @RestOptions}/{@code @RestData} with {@code ${state.<param>}} in
   * the URL). The entry keeps the template sync path (with {@code :name}) plus a regex + the param
   * names so the client can match a concrete path and inject the extracted params into the
   * structure. A view that hard-fails on the placeholder (e.g. parses it as a number and loads from
   * a DB) is skipped, exactly like a static view that needs a live backend.
   */
  public BundleEntry exportTemplate(String baseUrl, String templateRoute) {
    var paramNames = new ArrayList<String>();
    var m = PARAM_SEGMENT.matcher(templateRoute);
    while (m.find()) {
      paramNames.add(m.group(1));
    }
    var renderRoute = PARAM_SEGMENT.matcher(templateRoute).replaceAll(PARAM_PLACEHOLDER);
    var rendered = exportRoute(baseUrl, renderRoute);
    var syncPath = toSyncPath(templateRoute);
    var pattern = "^" + PARAM_SEGMENT.matcher(syncPath).replaceAll("([^/]+)") + "$";
    return new BundleEntry(
        templateRoute,
        syncPath,
        rendered.json(),
        rendered.ok(),
        rendered.skipReason(),
        pattern,
        paramNames);
  }

  /**
   * The {@code /mateu/v3/sync/<seg>} path segment for a route — mirrors the frontend's {@code
   * AxiosMateuApiClient} so the bundle keys line up with what the client computes: {@code "/foo" ->
   * "foo"}, blank/root {@code -> "_no_route"}.
   */
  public static String toSyncPath(String route) {
    var r = route == null ? "" : (route.startsWith("/") ? route.substring(1) : route);
    return r.isEmpty() ? "_no_route" : r;
  }

  /**
   * The wire ObjectMapper. MUST stay in sync with {@code io.mateu.SerializationConfiguration}
   * (mvc-core) — core cannot depend on mvc-core, so this is a deliberate duplicate, pinned by
   * MateuBundleExporterTest's byte-compat test.
   */
  public static ObjectMapper defaultWireMapper() {
    return new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
  }
}
