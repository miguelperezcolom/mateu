package io.mateu.core.infra;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.core.application.export.MateuBundleExporter.BundleManifest;
import java.util.function.Function;

/**
 * {@code GET /mateu/v3/bundle}: the static bundle rendered at RUNTIME (no build step) — the same
 * {@code manifest.json} the {@code mateu:bundle} Maven goal produces, rendered live from the app's
 * bean graph, so it has full fidelity (real services, real data) and needs no build. Point a static
 * shell's {@code <mateu-ui bundleUrl="…/mateu/v3/bundle">} at it, or curl it to snapshot the
 * bundle. With {@code ?params=true} the {@code :param} routes are bundled too, as templates.
 *
 * <p>The single body for every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP), which only
 * map the path, pick the thread (the exporter blocks: it {@code blockFirst()}s each route) and
 * write back {@link Answer#status()} and {@link Answer#body()} as {@code application/json}.
 *
 * <p>Each variant is computed once and cached: screen structure is stable within a deployment. A
 * serialization failure answers 500 with {@code {"error": "<message>"}}, a properly escaped JSON
 * body, and is not cached.
 */
public final class BundleEndpoint {

  /** Where it is served. */
  public static final String PATH = "/mateu/v3/bundle";

  /** The query parameter that also bundles {@code :param} routes, as templates. */
  public static final String PARAMS_QUERY = "params";

  /** HTTP 200. */
  public static final int OK = 200;

  /** HTTP 500. */
  public static final int SERVER_ERROR = 500;

  /** What an adapter writes back: always {@code application/json}. */
  public record Answer(int status, String body) {}

  /** Serializes a manifest; may fail. */
  @FunctionalInterface
  interface ManifestWriter {
    String write(BundleManifest manifest) throws Exception;
  }

  private final Function<Boolean, BundleManifest> exporter;
  private final ManifestWriter writer;
  private volatile String cached;
  private volatile String cachedWithParams;

  /**
   * @param service the app's Mateu service
   * @param classLoader the APP classloader (the one that sees {@code META-INF/mateu} route indexes)
   *     — pass the adapter class's own loader: the thread context classloader is unreliable off the
   *     request thread
   */
  public BundleEndpoint(MateuService service, ClassLoader classLoader) {
    this(
        includeParamRoutes ->
            new MateuBundleExporter(service).exportAll("", classLoader, true, includeParamRoutes),
        manifest -> MateuBundleExporter.defaultWireMapper().writeValueAsString(manifest));
  }

  BundleEndpoint(Function<Boolean, BundleManifest> exporter, ManifestWriter writer) {
    this.exporter = exporter;
    this.writer = writer;
  }

  /**
   * Renders (or answers from cache) one variant.
   *
   * @param includeParamRoutes the {@value #PARAMS_QUERY} query parameter
   */
  public Answer render(boolean includeParamRoutes) {
    var out = includeParamRoutes ? cachedWithParams : cached;
    if (out == null) {
      var manifest = exporter.apply(includeParamRoutes);
      try {
        out = writer.write(manifest);
      } catch (Exception e) {
        return new Answer(SERVER_ERROR, errorBody(e.getMessage()));
      }
      if (includeParamRoutes) {
        cachedWithParams = out;
      } else {
        cached = out;
      }
    }
    return new Answer(OK, out);
  }

  /** {@code {"error": "<message>"}}, escaped (a quote or a newline in the message stays JSON). */
  static String errorBody(String message) {
    return JsonNodeFactory.instance.objectNode().put("error", String.valueOf(message)).toString();
  }
}
