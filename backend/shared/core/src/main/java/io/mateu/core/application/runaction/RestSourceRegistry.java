package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.uidl.annotations.RestSource;
import io.mateu.uidl.annotations.RestSources;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceProvenance;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RestSourceCatalogSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * The app's catalogue of named REST sources — every endpoint its screens consume, declared once so
 * no surface has to repeat a URL.
 *
 * <p>Two producers feed one catalogue, exactly like {@link RouteRegistry}. The <b>derived</b> half
 * is {@code @RestSource} annotations on the registered routed classes plus whatever {@link
 * RestSourceCatalogSupplier} beans contribute at runtime; the <b>authored</b> half is a {@code
 * specs/ui/sources.yaml}, merged on top. <b>Authored wins</b> — explicit beats derived, the same
 * precedence the route registry and the layout inference use.
 *
 * <p>Unlike routes, source names are NOT relative to a mount: a name is global, because a source is
 * an endpoint rather than a screen and two mounts consuming the same endpoint should say so with
 * the same name. So there is one conventional file rather than one per mount.
 *
 * <p>Never fails: a broken file or an unloadable class logs and yields fewer entries, not an
 * outage. A surface referencing a name the catalogue does not carry is left as declared, which the
 * consumer reports — a missing entry must not take the screen down.
 */
@Slf4j
@Named
@Singleton
public class RestSourceRegistry {

  /** The conventional authored catalogue. */
  static final String CONVENTIONAL_SOURCES = "specs/ui/sources.yaml";

  private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());

  private volatile RestSourceCatalog catalog;

  /** The merged catalogue (authored over derived), loaded once. */
  public RestSourceCatalog catalog() {
    var loaded = catalog;
    if (loaded == null) {
      synchronized (this) {
        loaded = catalog;
        if (loaded == null) {
          loaded = load(classLoader());
          catalog = loaded;
        }
      }
    }
    return loaded;
  }

  /** The entry a surface references, or empty when the catalogue does not name it. */
  public Optional<RestSourceEntry> get(String name) {
    return catalog().get(name);
  }

  RestSourceCatalog load(ClassLoader classLoader) {
    var derived = derivedFrom(classLoader);
    var authored = authoredFrom(classLoader);
    var merged = authored.mergedOver(derived);
    if (!merged.hasNoSources()) {
      log.info(
          "REST source catalogue: {} source(s) ({} derived, {} authored) — {} to implement, {}"
              + " already served elsewhere",
          merged.sources().size(),
          derived.sources().size(),
          authored.sources().size(),
          merged.toImplement().size(),
          merged.consumed().size());
    }
    return merged;
  }

  /**
   * The derived half: {@code @RestSource} on every registered routed class, then whatever {@link
   * RestSourceCatalogSupplier} beans add. The beans go last so a catalogue built from configuration
   * can override a compiled-in default of the same name without an authored file.
   */
  RestSourceCatalog derivedFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? RestSourceRegistry.class.getClassLoader() : classLoader;
    var byName = new LinkedHashMap<String, RestSourceEntry>();
    for (var ref : RouteRegistrations.read(cl)) {
      Class<?> viewClass;
      try {
        viewClass = Class.forName(ref.className(), false, cl);
      } catch (Throwable t) {
        // A class we cannot load contributes nothing; route resolution reports the same problem
        // already, so failing here would just be a second, noisier voice.
        log.debug("REST source catalogue: skipping {} ({})", ref.className(), t.toString());
        continue;
      }
      for (var declared : declarationsOn(viewClass)) {
        var entry = entryOf(declared);
        if (entry != null) {
          byName.put(entry.name(), entry);
        }
      }
    }
    for (var entry : fromSupplierBeans()) {
      byName.put(entry.name(), entry);
    }
    return new RestSourceCatalog(List.copyOf(byName.values()));
  }

  /**
   * The {@code @RestSource} declarations on a class: the repeated ones, plus any carried by a
   * meta-annotation so a composed annotation can bundle a source the way the rest of the
   * framework's annotations compose.
   */
  private static List<RestSource> declarationsOn(Class<?> viewClass) {
    var found = new ArrayList<RestSource>();
    found.addAll(List.of(viewClass.getAnnotationsByType(RestSource.class)));
    for (var annotation : viewClass.getAnnotations()) {
      var type = annotation.annotationType();
      if (type.getName().startsWith("java.lang.annotation")) {
        continue;
      }
      found.addAll(List.of(type.getAnnotationsByType(RestSource.class)));
      var container = type.getAnnotation(RestSources.class);
      if (container != null) {
        found.addAll(List.of(container.value()));
      }
    }
    return found;
  }

  private List<RestSourceEntry> fromSupplierBeans() {
    try {
      var beans = MateuBeanProvider.getBeans(RestSourceCatalogSupplier.class);
      if (beans == null) {
        return List.of();
      }
      var entries = new ArrayList<RestSourceEntry>();
      for (var bean : beans) {
        var contributed = bean.restSources();
        if (contributed != null) {
          contributed.stream().filter(e -> e != null && !e.name().isBlank()).forEach(entries::add);
        }
      }
      return entries;
    } catch (Throwable t) {
      // No bean provider yet (build-time export, a bare unit test) — the annotated half stands on
      // its own, so this is not worth failing over.
      log.debug("REST source catalogue: no supplier beans available ({})", t.toString());
      return List.of();
    }
  }

  /** One {@code @RestSource} as a catalogue entry. */
  static RestSourceEntry entryOf(RestSource declared) {
    if (declared == null || declared.name() == null || declared.name().isBlank()) {
      return null;
    }
    var source =
        RestDataSource.builder()
            .url(declared.url())
            .method(declared.method())
            .headers(parseHeaders(declared.headers()))
            .body(declared.body())
            .itemsPath(declared.itemsPath())
            .valuePath(declared.valuePath())
            .labelPath(declared.labelPath())
            .proxy(declared.proxy())
            .build();
    return new RestSourceEntry(
        declared.name(),
        source,
        declared.provenance(),
        parseFields(declared.fields()),
        declared.totalPath(),
        declared.description());
  }

  /**
   * The authored half: {@code specs/ui/sources.yaml}, either a {@code sources:} envelope or a bare
   * list.
   */
  public RestSourceCatalog authoredFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? RestSourceRegistry.class.getClassLoader() : classLoader;
    try (InputStream is = cl.getResourceAsStream(CONVENTIONAL_SOURCES)) {
      if (is == null) {
        return RestSourceCatalog.empty();
      }
      var root = yaml.readTree(is);
      if (root == null) {
        return RestSourceCatalog.empty();
      }
      var node = root.has("sources") ? root.get("sources") : root;
      if (!node.isArray()) {
        return RestSourceCatalog.empty();
      }
      var entries = new ArrayList<RestSourceEntry>();
      for (var element : node) {
        var entry = entryOf(element);
        if (entry != null) {
          entries.add(entry);
        }
      }
      return new RestSourceCatalog(entries);
    } catch (Exception e) {
      log.warn("Failed to read {}: {}", CONVENTIONAL_SOURCES, e.getMessage());
      return RestSourceCatalog.empty();
    }
  }

  /**
   * One authored YAML entry as a catalogue entry.
   *
   * <p>The keys ARE the record's components — {@code name}, {@code source}, {@code provenance},
   * {@code fields}, {@code totalPath}, {@code description} — with the request nested under {@code
   * source}, exactly like a route file's keys are {@code RouteEntry}'s. That is what keeps the
   * GENERATED {@code sources-schema.json} an honest description of what this reads: a flat spelling
   * would be sugar the schema does not describe, so an editor would flag a valid file.
   */
  private RestSourceEntry entryOf(JsonNode node) {
    var name = text(node, "name");
    if (name.isBlank()) {
      log.warn("Ignoring a REST source with no name in {}", CONVENTIONAL_SOURCES);
      return null;
    }
    return new RestSourceEntry(
        name,
        sourceOf(node.get("source")),
        provenanceOf(node),
        mapOf(node, "fields"),
        text(node, "totalPath"),
        text(node, "description"));
  }

  /** The nested {@code source:} object as a descriptor. */
  private static RestDataSource sourceOf(JsonNode node) {
    if (node == null || !node.isObject()) {
      return RestDataSource.builder().build();
    }
    return RestDataSource.builder()
        .ref(text(node, "ref"))
        .url(text(node, "url"))
        .method(node.hasNonNull("method") ? node.get("method").asText() : "GET")
        .headers(mapOf(node, "headers"))
        .body(text(node, "body"))
        .itemsPath(text(node, "itemsPath"))
        .valuePath(node.hasNonNull("valuePath") ? node.get("valuePath").asText() : "value")
        .labelPath(node.hasNonNull("labelPath") ? node.get("labelPath").asText() : "label")
        .proxy(node.hasNonNull("proxy") && node.get("proxy").asBoolean())
        .build();
  }

  private RestSourceProvenance provenanceOf(JsonNode node) {
    var declared = text(node, "provenance");
    if (declared.isBlank()) {
      return RestSourceProvenance.auto;
    }
    try {
      return RestSourceProvenance.valueOf(declared.trim());
    } catch (IllegalArgumentException e) {
      log.warn(
          "Unknown provenance '{}' in {} — inferring it from the url instead",
          declared,
          CONVENTIONAL_SOURCES);
      return RestSourceProvenance.auto;
    }
  }

  /** A YAML object of string values as a map; empty when absent or not an object. */
  private static Map<String, String> mapOf(JsonNode node, String field) {
    var map = new LinkedHashMap<String, String>();
    if (node != null && node.hasNonNull(field) && node.get(field).isObject()) {
      node.get(field)
          .fields()
          .forEachRemaining(entry -> map.put(entry.getKey(), entry.getValue().asText()));
    }
    return map;
  }

  private static String text(JsonNode node, String field) {
    return node != null && node.hasNonNull(field) ? node.get(field).asText() : "";
  }

  /** {@code "Name: Value"} header declarations into a map. */
  static Map<String, String> parseHeaders(String[] headers) {
    var map = new LinkedHashMap<String, String>();
    if (headers == null) {
      return map;
    }
    for (var header : headers) {
      int separator = header == null ? -1 : header.indexOf(':');
      if (separator > 0) {
        map.put(header.substring(0, separator).trim(), header.substring(separator + 1).trim());
      }
    }
    return map;
  }

  /** {@code "name=dot.path"} field declarations into a map. */
  static Map<String, String> parseFields(String[] fields) {
    var map = new LinkedHashMap<String, String>();
    if (fields == null) {
      return map;
    }
    for (var field : fields) {
      int separator = field == null ? -1 : field.indexOf('=');
      if (separator > 0) {
        map.put(field.substring(0, separator).trim(), field.substring(separator + 1).trim());
      }
    }
    return map;
  }

  private static ClassLoader classLoader() {
    var contextClassLoader = Thread.currentThread().getContextClassLoader();
    return contextClassLoader == null
        ? RestSourceRegistry.class.getClassLoader()
        : contextClassLoader;
  }
}
