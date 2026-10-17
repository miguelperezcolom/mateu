package io.mateu.core.application.export;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RouteTable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * The whole bundle: metadata, one entry per requested route, and the mount's authored route
 * registry.
 *
 * @param routes the entries from {@code specs/ui/routes.yaml}. They travel with the bundle because
 *     in a statically deployed mount there is no server left to ask what a URL means — the renderer
 *     has to resolve it from shipped data. Only the AUTHORED half is shipped: the derived half is
 *     route→class, and a class is exactly what a bundle with no backend cannot use.
 * @param sources the REST source catalogue, shipped ONCE rather than repeated inside every entry's
 *     wire JSON. A statically served screen resolves its own references from here, and — because it
 *     is one list in one file — re-pointing a deployment at another environment is an edit of this
 *     table rather than a rebuild of the bundle.
 */
public record BundleManifest(
    String baseUrl,
    String generatedAt,
    boolean staticOnly,
    List<BundleEntry> entries,
    RouteTable routes,
    RestSourceCatalog sources,
    /**
     * The capability tokens the bundled app REQUIRES from whatever renderer serves it (the union of
     * every entry's {@code AppDto.requiredCapabilities}). A statically deployed bundle can outlive
     * the renderer build a CDN serves it with; this lets a host check, from the manifest alone,
     * that it implements what the bundle needs — compatibility by capability, not version. Derived
     * from the entries, so it never contradicts them; deliberately NOT part of {@link
     * #structureHash()} (it is redundant with the entry JSON the hash already covers).
     */
    List<String> requiredCapabilities,
    /**
     * SPECS MODE (Phase 6, #1/#10): the RAW authored definitions, keyed by the file name a route
     * entry's {@code definition} names (e.g. {@code "about.yaml"}), each parsed to JSON. This is
     * what lets a static site expand a definition-only route ({@code definition}, no {@code
     * viewModel}) to the wire IN THE BROWSER via the client-side expander — edit a definition and
     * refresh, no backend and no re-export. Shipped ALONGSIDE the pre-rendered entries (the client
     * prefers a pre-rendered increment and falls back to expanding the raw definition), so it is
     * purely additive. Only client-expandable definitions travel; a {@code viewModel} route needs a
     * backend and is omitted.
     */
    Map<String, JsonNode> definitions,
    /**
     * The ACTION catalogue, shipped ONCE like {@link #sources}: every named client-runnable action
     * with its flow already lowered to commands. A statically served screen (or shell menu) naming
     * an id its owner does not declare resolves it here. Not part of {@link #structureHash()}, for
     * the same reason as the source catalogue.
     */
    List<io.mateu.dtos.ActionDto> actions,
    /**
     * The translation catalogue, locale → key → text, so a page with no server resolves its {@code
     * ${i18n.…}} expressions in the browser for the visitor's locale ({@code AppDto.locale} or
     * {@code navigator.language}). Pre-rendered entries keep the expressions for that reason. Not
     * part of {@link #structureHash()}: a translation fix does not change the screens.
     */
    Map<String, Map<String, String>> translations,
    /**
     * The deployment environment the {@link #sources} were resolved for ({@code
     * -Dmateu.bundle.environment}), or null when they are as authored. Informative: the catalogue
     * shipped here is already the resolved one.
     */
    String environment,
    /**
     * True when the bundle was built with the mock flag ({@code -Dmateu.bundle.mock=true}, see
     * {@code SampleSources}): the catalogue ships its sources' SAMPLE data and the browser answers
     * with it instead of calling the endpoints. Null otherwise — and then the samples are not
     * shipped at all.
     */
    Boolean mockSources) {

  public BundleManifest {
    actions = actions == null ? List.of() : List.copyOf(actions);
    translations = translations == null ? Map.of() : translations;
  }

  /** Pre-sample-mode shape: a bundle that calls its sources for real. */
  public BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes,
      RestSourceCatalog sources,
      List<String> requiredCapabilities,
      Map<String, JsonNode> definitions,
      List<io.mateu.dtos.ActionDto> actions,
      Map<String, Map<String, String>> translations,
      String environment) {
    this(
        baseUrl,
        generatedAt,
        staticOnly,
        entries,
        routes,
        sources,
        requiredCapabilities,
        definitions,
        actions,
        translations,
        environment,
        null);
  }

  /** Pre-i18n shape: no translations shipped, sources as authored. */
  public BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes,
      RestSourceCatalog sources,
      List<String> requiredCapabilities,
      Map<String, JsonNode> definitions,
      List<io.mateu.dtos.ActionDto> actions) {
    this(
        baseUrl,
        generatedAt,
        staticOnly,
        entries,
        routes,
        sources,
        requiredCapabilities,
        definitions,
        actions,
        Map.of(),
        null);
  }

  /** Pre-action-catalogue shape: no catalogue shipped. */
  public BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes,
      RestSourceCatalog sources,
      List<String> requiredCapabilities,
      Map<String, JsonNode> definitions) {
    this(
        baseUrl,
        generatedAt,
        staticOnly,
        entries,
        routes,
        sources,
        requiredCapabilities,
        definitions,
        List.of());
  }

  /** Pre-registry shape, kept so existing callers and golden files are unaffected. */
  public BundleManifest(
      String baseUrl, String generatedAt, boolean staticOnly, List<BundleEntry> entries) {
    this(baseUrl, generatedAt, staticOnly, entries, RouteTable.empty());
  }

  /** Pre-catalogue shape, kept for the same reason. */
  public BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes) {
    this(baseUrl, generatedAt, staticOnly, entries, routes, RestSourceCatalog.empty());
  }

  /** Pre-capabilities shape: the required capabilities are aggregated from the entries. */
  public BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes,
      RestSourceCatalog sources) {
    this(baseUrl, generatedAt, staticOnly, entries, routes, sources, Map.of());
  }

  /** Pre-specs-mode shape: no raw definitions shipped (pre-rendered entries only). */
  public BundleManifest(
      String baseUrl,
      String generatedAt,
      boolean staticOnly,
      List<BundleEntry> entries,
      RouteTable routes,
      RestSourceCatalog sources,
      Map<String, JsonNode> definitions) {
    this(
        baseUrl,
        generatedAt,
        staticOnly,
        entries,
        routes,
        sources,
        aggregateCapabilities(entries),
        definitions);
  }

  /**
   * The union of every entry's {@code AppDto.requiredCapabilities}, read out of the rendered wire
   * JSON. Walks for the KEY rather than a known DTO shape, so it keeps working if the AppDto moves
   * within the tree — the same channel-independent approach the OpenAPI derivation uses.
   */
  static List<String> aggregateCapabilitiesOf(List<BundleEntry> entries) {
    return aggregateCapabilities(entries);
  }

  static List<String> aggregateCapabilities(List<BundleEntry> entries) {
    var mapper = new ObjectMapper();
    var caps = new java.util.TreeSet<String>();
    for (var entry : entries) {
      if (!entry.ok() || entry.json() == null || entry.json().isBlank()) {
        continue;
      }
      try {
        collectCapabilities(mapper.readTree(entry.json()), caps);
      } catch (Exception ignore) {
        // a malformed entry must not sink the manifest; its capabilities are simply not counted.
      }
    }
    return new ArrayList<>(caps);
  }

  private static void collectCapabilities(
      com.fasterxml.jackson.databind.JsonNode node, java.util.Set<String> out) {
    if (node == null) {
      return;
    }
    if (node.isObject()) {
      var rc = node.get("requiredCapabilities");
      if (rc != null && rc.isArray()) {
        rc.forEach(
            n -> {
              if (n.isTextual() && !n.asText().isBlank()) {
                out.add(n.asText());
              }
            });
      }
      node.forEach(child -> collectCapabilities(child, out));
    } else if (node.isArray()) {
      node.forEach(child -> collectCapabilities(child, out));
    }
  }

  /**
   * A stable identity for what this bundle CONTAINS, independent of when it was built.
   *
   * <p>A bundle is derivation frozen in time: deployed to a CDN it can outlive the model it came
   * from, and in a hybrid deploy a client can be answering loads from build N while posting actions
   * to a backend at N+1 — with nothing anywhere saying so. {@code generatedAt} does not help: two
   * builds of the same source differ, and a stale bundle looks as fresh as any other.
   *
   * <p>This makes the bundle a <em>cache</em> rather than a fork: two manifests with the same hash
   * carry the same screens, and a mismatch against the backend's is something a client or a deploy
   * check can act on.
   *
   * <p>The source catalogue is deliberately NOT part of it. Re-pointing a deployment at another
   * environment is an edit of that table, and it leaves the screens identical — folding it in would
   * make a re-pointed bundle look like a different build from the backend it talks to, which is
   * precisely the workflow shipping the catalogue exists to enable.
   */
  public String structureHash() {
    var material =
        entries.stream()
            .sorted(java.util.Comparator.comparing(e -> String.valueOf(e.route())))
            .map(
                e ->
                    e.route()
                        + "\u0000"
                        + e.ok()
                        + "\u0000"
                        + MateuBundleExporter.withoutCatalogue(e.json())
                        + (e.contentJson() == null
                            ? ""
                            : "\u0000" + MateuBundleExporter.withoutCatalogue(e.contentJson())))
            .collect(java.util.stream.Collectors.joining("\u0001"));
    try {
      var digest = java.security.MessageDigest.getInstance("SHA-256");
      var bytes = digest.digest(material.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      var out = new StringBuilder(bytes.length * 2);
      for (var b : bytes) {
        out.append(Character.forDigit((b >> 4) & 0xF, 16)).append(Character.forDigit(b & 0xF, 16));
      }
      return out.toString();
    } catch (java.security.NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 is required by the JLS", e);
    }
  }
}
