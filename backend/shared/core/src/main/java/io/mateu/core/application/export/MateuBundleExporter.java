package io.mateu.core.application.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.HeadlessHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
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

  /** One route's export result. {@code json} is null when skipped ({@code ok=false}). */
  public record BundleEntry(
      String route, String syncPath, String json, boolean ok, String skipReason) {}

  /** The whole bundle: metadata + one entry per requested route. */
  public record BundleManifest(
      String baseUrl, String generatedAt, boolean staticOnly, List<BundleEntry> entries) {}

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
   * Render every declared route discovered from the classloader's route index (skipping {@code
   * :param} routes when {@code staticOnly}). The one-call entry point shared by the build-time
   * Maven goal and the runtime bundle endpoint.
   */
  public BundleManifest exportAll(String baseUrl, ClassLoader cl, boolean staticOnly) {
    var routes =
        RouteRegistrations.read(cl).stream()
            .map(RouteRegistrations.RouteRef::route)
            .filter(r -> !staticOnly || RouteRegistrations.isStatic(r))
            .distinct()
            .toList();
    return export(baseUrl, routes);
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
