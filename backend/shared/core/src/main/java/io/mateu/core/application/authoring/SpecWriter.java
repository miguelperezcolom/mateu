package io.mateu.core.application.authoring;

import io.mateu.uidl.UserFacingException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

/**
 * Writes an authored definition into the specs directory — the {@code mateu_save_spec} tool, only
 * ever offered in development mode. The path rule is normative (the same in .NET, Python and the
 * sidecar): a relative {@code .yaml}/{@code .yml} path with no {@code ..}, {@code .} or empty
 * segment, no backslash, no drive letter, at most 255 characters, that stays inside the specs
 * directory once symbolic links are followed.
 */
public final class SpecWriter {

  private static final Pattern DRIVE = Pattern.compile("^[A-Za-z]:");

  private SpecWriter() {}

  /** Whether {@code path} is acceptable before touching the disk. */
  public static boolean isAcceptable(String path) {
    if (path == null || path.isBlank() || path.length() > 255) {
      return false;
    }
    if (path.indexOf('\0') >= 0
        || path.contains("\\")
        || path.startsWith("/")
        || DRIVE.matcher(path).find()) {
      return false;
    }
    if (!(path.endsWith(".yaml") || path.endsWith(".yml"))) {
      return false;
    }
    for (var segment : path.split("/", -1)) {
      if (segment.isEmpty() || segment.equals(".") || segment.equals("..")) {
        return false;
      }
    }
    return true;
  }

  /** The kinds an agent may save: what a screen is made of, never what a request is made of. */
  private static final java.util.Set<String> SAVABLE_KINDS =
      java.util.Set.of("component", "envelope", "partial", "components");

  /** File names (any extension, any folder) the catalogues are read from by convention. */
  private static final java.util.Set<String> CATALOGUE_NAMES =
      java.util.Set.of("sources", "routes", "actions", "types", "project");

  /** Folders the catalogues are read from by convention. */
  private static final java.util.Set<String> CATALOGUE_FOLDERS =
      java.util.Set.of("environments", "translations");

  /** The request keys a surface naming a catalogue source by {@code ref} may not override. */
  private static final java.util.Set<String> REQUEST_KEYS =
      java.util.Set.of("url", "baseUrl", "method", "headers", "body", "proxy");

  /**
   * Whether {@code path} names a catalogue file ({@code sources.yaml}, {@code routes.yml}, {@code
   * environments/…}, {@code translations/…}…): an agent never writes those (NM3).
   */
  public static boolean isCatalogueFile(String path) {
    if (path == null) {
      return false;
    }
    var segments = path.split("/", -1);
    if (segments.length > 1 && CATALOGUE_FOLDERS.contains(segments[0])) {
      return true;
    }
    var name = segments[segments.length - 1];
    int dot = name.lastIndexOf('.');
    return CATALOGUE_NAMES.contains(dot >= 0 ? name.substring(0, dot) : name);
  }

  /** The message of a refused catalogue file (shown as written). */
  public static String catalogueRefusal(String path) {
    return "Refused path "
        + UidlValidator.quote(path == null ? "" : path)
        + ": catalogue files (sources, routes, actions, types, project, environments, translations)"
        + " are written by hand.";
  }

  /**
   * Why an agent may not save this definition, or null when it may (NM3): an agent saves what a
   * screen is made of — a page, a layout envelope, a partial, a business-component catalogue — and
   * nothing that decides where a request goes or what it carries. Sources, environments, routes,
   * actions, types, translations, mounts and project settings are written by hand; and a page may
   * not reference a secret ({@code ${secret.…}}), mark a request {@code proxy: true}, or override
   * the request ({@code url}, {@code baseUrl}, {@code method}, {@code headers}, {@code body},
   * {@code proxy}) of a source it names by {@code ref} — otherwise, in dev mode, an agent could
   * re-point a proxied source at its own server and have Mateu send it the source's secret.
   *
   * @param kind the validator's classification of the definition (null when unknown)
   */
  public static String agentRefusal(String kind, String yaml) {
    if (kind != null && !SAVABLE_KINDS.contains(kind)) {
      return "Only a page, a partial or a business-component catalogue can be saved by an agent; a "
          + UidlValidator.quote(kind)
          + " definition is written by hand.";
    }
    com.fasterxml.jackson.databind.JsonNode tree;
    try {
      tree = expandedTree(yaml == null ? "" : yaml);
    } catch (org.yaml.snakeyaml.error.YAMLException e) {
      if (e.getMessage() != null && e.getMessage().contains("aliases")) {
        return SCRIPT_REFUSAL; // aliases expanding past any page's size: not checkable, not saved
      }
      return null; // not YAML: the validation report already says so
    } catch (RuntimeException | StackOverflowError e) {
      return SCRIPT_REFUSAL; // e.g. an alias inside its own anchor: not checkable, not saved
    }
    if (carriesARequest(tree)) {
      return REQUEST_REFUSAL;
    }
    // R6: a saved spec is served through the ordinary (trusted) render path, so it may not carry
    // what the untrusted strip keeps out of an agent's pushed screen
    return io.mateu.core.application.runaction.UntrustedDefinition.scriptCapable(tree)
        ? SCRIPT_REFUSAL
        : null;
  }

  /** The message of a definition that would run code in the browser (shown as written). */
  public static final String SCRIPT_REFUSAL =
      "A definition saved by an agent may not run code in the browser: no event-handler, import or"
          + " srcdoc attribute, no raw-HTML or script-capable element, no javascript: url, RunJS"
          + " rule or action js, and no MicroFrontend loaded from another server.";

  /**
   * The definition as a JSON tree with its YAML aliases EXPANDED (SnakeYAML's safe loader, at most
   * 50 aliases per collection): Jackson's tree reader does not resolve an alias of a mapping, so an
   * {@code import:} (or a {@code proxy: true}) written once under an anchor and aliased into an
   * {@code Element} would not be seen where it lands.
   */
  private static com.fasterxml.jackson.databind.JsonNode expandedTree(String yaml) {
    var options = new org.yaml.snakeyaml.LoaderOptions();
    options.setAllowRecursiveKeys(false);
    options.setMaxAliasesForCollections(50);
    var loaded =
        new org.yaml.snakeyaml.Yaml(new org.yaml.snakeyaml.constructor.SafeConstructor(options))
            .load(yaml);
    return new com.fasterxml.jackson.databind.ObjectMapper()
        .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
        .valueToTree(loaded);
  }

  /** The message of a definition that would decide a request (shown as written). */
  public static final String REQUEST_REFUSAL =
      "A definition saved by an agent may not reference a secret, proxy a request through the"
          + " server or override the request of a catalogue source; declare those in sources.yaml"
          + " by hand.";

  /**
   * A {@code ${secret.…}} reference as the interpolator reads it: the expression is trimmed, so
   * {@code ${ secret.KEY }} resolves a secret too (the sidecar's text rule already said so).
   */
  private static final Pattern SECRET_REFERENCE = Pattern.compile("\\$\\{\\s*secret\\.");

  private static boolean carriesARequest(com.fasterxml.jackson.databind.JsonNode node) {
    if (node == null) {
      return false;
    }
    if (node.isTextual()) {
      return SECRET_REFERENCE.matcher(node.asText()).find();
    }
    if (node.isObject()) {
      var proxy = node.get("proxy");
      if (proxy != null && (proxy.asBoolean(false) || "true".equalsIgnoreCase(proxy.asText()))) {
        return true;
      }
      var ref = node.get("ref");
      if (ref != null && ref.isTextual() && !ref.asText().isBlank()) {
        for (var key : REQUEST_KEYS) {
          if (node.has(key)) {
            return true;
          }
        }
      }
      var names = node.fieldNames();
      while (names.hasNext()) {
        if (SECRET_REFERENCE.matcher(names.next()).find()) {
          return true;
        }
      }
    }
    for (var child : node) {
      if (carriesARequest(child)) {
        return true;
      }
    }
    return false;
  }

  /** The message of a refused path (shown as written). */
  public static String refusal(String path) {
    return "Invalid path "
        + UidlValidator.quote(path == null ? "" : path)
        + ": give a relative .yaml or .yml path inside the specs directory (no \"..\", no absolute"
        + " path).";
  }

  /**
   * Writes {@code yaml} at {@code path} under {@code root}, creating the folders it needs.
   *
   * @return the number of bytes written
   * @throws UserFacingException when the path is refused
   */
  public static int write(Path root, String path, String yaml) throws IOException {
    if (!isAcceptable(path)) {
      throw new UserFacingException(refusal(path));
    }
    var base = root.toAbsolutePath().normalize();
    var target = base.resolve(path).normalize();
    if (!target.startsWith(base)) {
      throw new UserFacingException(refusal(path));
    }
    var realBase = base.toRealPath();
    var existing = target.getParent();
    while (existing != null && !Files.exists(existing)) {
      existing = existing.getParent();
    }
    if (existing == null || !existing.toRealPath().startsWith(realBase)) {
      throw new UserFacingException(refusal(path));
    }
    if (Files.isSymbolicLink(target) && !target.toRealPath().startsWith(realBase)) {
      throw new UserFacingException(refusal(path));
    }
    Files.createDirectories(target.getParent());
    var bytes = yaml.getBytes(StandardCharsets.UTF_8);
    Files.write(target, bytes);
    return bytes.length;
  }
}
