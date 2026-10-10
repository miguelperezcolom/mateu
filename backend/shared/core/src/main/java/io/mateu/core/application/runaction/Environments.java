package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.uidl.data.Environment;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * Deployment environments for the REST source catalogue: a {@code type: Environment} file (or
 * {@code specs/ui/environments/<name>.yaml}) re-points named sources — their base url, url, headers
 * or proxy flag — WITHOUT editing {@code sources.yaml}, and the ACTIVE one is overlaid on the
 * merged catalogue by {@link RestSourceRegistry}. Because every leg reads that one catalogue — the
 * wire ({@code AppDto.restSources}), the server-side proxy and the static bundle's manifest — the
 * overlay reaches all of them at once.
 *
 * <p>The active environment is named by {@code -Dmateu.environment} or the {@code
 * MATEU_ENVIRONMENT} variable (the {@code mateu-bundle} goal sets the property from its {@code
 * environment} parameter). None active, or an unknown name (warned), leaves the catalogue as
 * authored.
 *
 * <p>Only the DEPLOYMENT of an endpoint is overridable ({@link Environment.SourceOverride}):
 * method, body, paths and field mapping are the contract the screens read and stay as authored.
 * Secrets never belong here — a literal credential header is warned about; write {@code
 * ${secret.X}} and let the proxy resolve it from {@code MATEU_SECRET_X}.
 */
@Slf4j
public final class Environments {

  public static final String PROPERTY = "mateu.environment";
  public static final String ENV_VAR = "MATEU_ENVIRONMENT";
  static final String CONVENTIONAL_DIR = "specs/ui/environments/";

  private static final ObjectMapper YAML = new ObjectMapper(new YAMLFactory());

  private Environments() {}

  /** The name of the active environment, or null when none is configured. */
  public static String activeName() {
    var name = System.getProperty(PROPERTY);
    if (name == null || name.isBlank()) {
      name = System.getenv(ENV_VAR);
    }
    return name == null || name.isBlank() ? null : name.trim();
  }

  /** Every environment declared on the classpath, by name. */
  public static Map<String, Environment> all(ClassLoader classLoader) {
    var cl = classLoader == null ? Environments.class.getClassLoader() : classLoader;
    var byName = new LinkedHashMap<String, Environment>();
    for (var path : MountRegistry.yamlResourcePaths(cl)) {
      try (InputStream is = cl.getResourceAsStream(path)) {
        if (is == null) {
          continue;
        }
        var environment = parse(YAML.readTree(is), path);
        if (environment != null) {
          byName.put(environment.name(), environment);
        }
      } catch (Exception e) {
        log.warn("Failed to read environment {}: {}", path, e.getMessage());
      }
    }
    return byName;
  }

  /** The active environment, if one is configured and declared. */
  public static Optional<Environment> active(ClassLoader classLoader) {
    var name = activeName();
    if (name == null) {
      return Optional.empty();
    }
    var environment = all(classLoader).get(name);
    if (environment == null) {
      log.warn(
          "Environment '{}' is active ({} / {}) but no environment file declares it — the REST"
              + " sources stay as authored",
          name,
          PROPERTY,
          ENV_VAR);
    }
    return Optional.ofNullable(environment);
  }

  /** A parsed file as an environment, or null when it is not one. */
  public static Environment parse(JsonNode root, String path) {
    if (root == null || !root.isObject()) {
      return null;
    }
    var type = root.path("type").asText("");
    var conventional = path != null && path.startsWith(CONVENTIONAL_DIR);
    if (!"Environment".equals(type) && !(conventional && type.isEmpty())) {
      return null;
    }
    var name = root.path("name").asText("");
    if (name.isBlank() && path != null) {
      name = path.substring(path.lastIndexOf('/') + 1).replaceFirst("\\.ya?ml$", "");
    }
    var sources = new LinkedHashMap<String, Environment.SourceOverride>();
    var node = root.get("sources");
    if (node != null && node.isObject()) {
      node.fields()
          .forEachRemaining(
              entry -> {
                var o = entry.getValue();
                var headers = new LinkedHashMap<String, String>();
                if (o.hasNonNull("headers") && o.get("headers").isObject()) {
                  o.get("headers")
                      .fields()
                      .forEachRemaining(h -> headers.put(h.getKey(), h.getValue().asText()));
                }
                warnOnLiteralSecrets(name(path), entry.getKey(), headers);
                sources.put(
                    entry.getKey(),
                    new Environment.SourceOverride(
                        o.hasNonNull("baseUrl") ? o.get("baseUrl").asText() : null,
                        o.hasNonNull("url") ? o.get("url").asText() : null,
                        headers,
                        o.hasNonNull("proxy") ? o.get("proxy").asBoolean() : null));
              });
    }
    return new Environment(name, sources);
  }

  private static String name(String path) {
    return path == null ? "?" : path;
  }

  /** A credential-looking header with a literal value is a secret in a file: say so, loudly. */
  private static void warnOnLiteralSecrets(
      String path, String source, Map<String, String> headers) {
    headers.forEach(
        (header, value) -> {
          var lower = header.toLowerCase(java.util.Locale.ROOT);
          var credential =
              lower.equals("authorization")
                  || lower.contains("api-key")
                  || lower.contains("apikey")
                  || lower.contains("token")
                  || lower.contains("secret");
          if (credential && value != null && !value.contains("${")) {
            log.warn(
                "Environment {} gives source '{}' a literal '{}' header: never put a secret in an"
                    + " environment file — write ${secret.X} and set MATEU_SECRET_X on the server",
                path,
                source,
                header);
          }
        });
  }

  /** The catalogue with the active environment (if any) overlaid. */
  public static RestSourceCatalog overlayActive(RestSourceCatalog catalog, ClassLoader cl) {
    return active(cl).map(environment -> overlay(catalog, environment)).orElse(catalog);
  }

  /** The catalogue with {@code environment}'s overrides applied to the entries it names. */
  public static RestSourceCatalog overlay(RestSourceCatalog catalog, Environment environment) {
    if (environment == null || environment.sources().isEmpty()) {
      return catalog;
    }
    var known = new java.util.HashSet<String>();
    var out = new ArrayList<RestSourceEntry>();
    for (var entry : catalog.sources()) {
      known.add(entry.name());
      var override = environment.sources().get(entry.name());
      out.add(override == null ? entry : overlay(entry, override));
    }
    environment.sources().keySet().stream()
        .filter(name -> !known.contains(name))
        .forEach(
            name ->
                log.warn(
                    "Environment '{}' overrides source '{}', which the catalogue does not declare",
                    environment.name(),
                    name));
    log.info(
        "REST sources: environment '{}' re-points {} source(s)",
        environment.name(),
        environment.sources().keySet().stream().filter(known::contains).count());
    return new RestSourceCatalog(out);
  }

  static RestSourceEntry overlay(RestSourceEntry entry, Environment.SourceOverride override) {
    var source = entry.source() == null ? RestDataSource.builder().build() : entry.source();
    var url = source.url();
    if (override.url() != null && !override.url().isBlank()) {
      url = override.url();
    } else if (override.baseUrl() != null && !override.baseUrl().isBlank()) {
      url = rebase(url, override.baseUrl());
    }
    var headers = new LinkedHashMap<String, String>();
    if (source.headers() != null) {
      headers.putAll(source.headers());
    }
    headers.putAll(override.headers());
    var repointed =
        new RestDataSource(
            source.ref(),
            url,
            source.method(),
            headers,
            source.body(),
            source.itemsPath(),
            source.valuePath(),
            source.labelPath(),
            override.proxy() != null ? override.proxy() : source.proxy());
    return new RestSourceEntry(
        entry.name(),
        repointed,
        entry.provenance(),
        entry.fields(),
        entry.totalPath(),
        entry.description());
  }

  /**
   * {@code url} moved to {@code baseUrl}: an absolute url keeps its path and query under the new
   * origin (a base url with a path of its own prefixes it); a relative url gets the base url
   * prepended. Placeholders ({@code ${state.id}}) survive untouched.
   */
  static String rebase(String url, String baseUrl) {
    var base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    if (url == null || url.isBlank()) {
      return base;
    }
    var schemeEnd = url.indexOf("://");
    String rest;
    if (schemeEnd > 0) {
      var pathStart = url.indexOf('/', schemeEnd + 3);
      rest = pathStart < 0 ? "" : url.substring(pathStart);
    } else {
      rest = url.startsWith("/") ? url : "/" + url;
    }
    return base + rest;
  }

  /** For the manifest / tooling: every declared environment's name. */
  public static List<String> names(ClassLoader cl) {
    return List.copyOf(all(cl).keySet());
  }
}
