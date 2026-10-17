package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.uidl.data.FieldTypeCatalog;
import io.mateu.uidl.data.FieldTypeEntry;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.FieldTypeCatalogSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * The app's FIELD TYPE catalogue — its domain vocabulary ({@code OrderStatus}, {@code Money},
 * {@code Email}): what a concept looks like as a field or a column, declared once.
 *
 * <p>Two producers, one table, exactly like {@link RestSourceRegistry}: {@link
 * FieldTypeCatalogSupplier} beans (code, the <b>derived</b> half) and {@code specs/ui/types.yaml}
 * (the <b>authored</b> half), merged by id with <b>authored winning</b>. Names are global, not per
 * mount: a type is vocabulary, not a screen.
 *
 * <p>Never fails: a broken file or entry logs and yields fewer types. A field naming a type the
 * catalogue does not carry is WARNed about by {@link FieldTypeResolver} and rendered as declared.
 */
@Slf4j
@Named
@Singleton
public class FieldTypeRegistry implements io.mateu.core.infra.dev.SpecsCache {

  /** The conventional authored catalogue. */
  static final String CONVENTIONAL_TYPES = "specs/ui/types.yaml";

  private final ObjectMapper yaml =
      new ObjectMapper(new YAMLFactory())
          .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  private volatile FieldTypeCatalog catalog;

  public FieldTypeRegistry() {
    io.mateu.core.infra.dev.DevSpecs.register(this);
  }

  /** Dev mode: a spec changed — the catalogue is read again on next use. */
  @Override
  public void invalidateSpecs() {
    catalog = null;
  }

  /** The merged catalogue (authored over code), loaded once. */
  public FieldTypeCatalog catalog() {
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

  /** {@code tree} with its {@code fieldType} references resolved against this catalogue. */
  public JsonNode resolve(JsonNode tree) {
    if (tree == null || !FieldTypeResolver.mentionsAFieldType(tree)) {
      return tree; // no reference: the catalogue is not even loaded
    }
    return FieldTypeResolver.resolve(tree, catalog());
  }

  /**
   * {@code tree} resolved against the app's catalogue, for the YAML readers that are not beans
   * (partials, the business-component catalogue): the container's registry when there is one, else
   * a fresh one read from the classpath.
   */
  public static JsonNode resolveWithAppTypes(JsonNode tree) {
    if (tree == null || !FieldTypeResolver.mentionsAFieldType(tree)) {
      return tree;
    }
    FieldTypeRegistry registry = null;
    try {
      registry = MateuBeanProvider.getBean(FieldTypeRegistry.class);
    } catch (Throwable t) {
      log.debug("No field type registry bean ({})", t.toString());
    }
    return (registry != null ? registry : new FieldTypeRegistry()).resolve(tree);
  }

  FieldTypeCatalog load(ClassLoader classLoader) {
    var derived = new FieldTypeCatalog(fromSupplierBeans());
    var authored = authoredFrom(classLoader);
    var merged = authored.mergedOver(derived);
    if (!merged.hasNoTypes()) {
      log.info(
          "Field type catalogue: {} type(s) ({} from code, {} authored)",
          merged.types().size(),
          derived.types().size(),
          authored.types().size());
    }
    return merged;
  }

  private List<FieldTypeEntry> fromSupplierBeans() {
    try {
      var beans = MateuBeanProvider.getBeans(FieldTypeCatalogSupplier.class);
      if (beans == null) {
        return List.of();
      }
      var byId = new LinkedHashMap<String, FieldTypeEntry>();
      for (var bean : beans) {
        var contributed = bean.fieldTypes();
        if (contributed != null) {
          contributed.stream()
              .filter(type -> type != null && !type.id().isBlank())
              .forEach(type -> byId.put(type.id(), type));
        }
      }
      return List.copyOf(byId.values());
    } catch (Throwable t) {
      // No bean provider (build-time export, a bare unit test): the authored half stands alone.
      log.debug("Field type catalogue: no supplier beans available ({})", t.toString());
      return List.of();
    }
  }

  /** The {@code type:} header a standalone types file declares. */
  static final String TYPE = "Types";

  /**
   * The authored half: {@code specs/ui/types.yaml} (with or without its {@code type: Types} header)
   * and every other file under {@code specs/ui} declaring {@code type: Types}, in discovery order —
   * a later file's entry replaces an earlier one of the same id, exactly like the action catalogue.
   * Each file is a {@code types:} envelope or a bare list. The keys ARE {@link FieldTypeEntry}'s
   * components, which is what keeps the GENERATED {@code types-schema.json} an honest description
   * of the file. Before 2026-10-17 only the conventional name was read, so a Types file the IDE
   * wizard created under another name was silently ignored.
   */
  public FieldTypeCatalog authoredFrom(ClassLoader classLoader) {
    var cl =
        io.mateu.core.infra.dev.DevSpecs.classLoader(
            classLoader == null ? FieldTypeRegistry.class.getClassLoader() : classLoader);
    var files = new java.util.LinkedHashSet<String>();
    if (cl.getResource(CONVENTIONAL_TYPES) != null) {
      files.add(CONVENTIONAL_TYPES);
    }
    for (var path : MountRegistry.yamlResourcePaths(cl)) {
      if (!path.equals(CONVENTIONAL_TYPES) && TYPE.equals(typeOf(cl, path))) {
        files.add(path);
      }
    }
    var byId = new LinkedHashMap<String, FieldTypeEntry>();
    for (var file : files) {
      for (var entry : read(cl, file)) {
        byId.put(entry.id(), entry);
      }
    }
    return new FieldTypeCatalog(List.copyOf(byId.values()));
  }

  private List<FieldTypeEntry> read(ClassLoader cl, String path) {
    try (InputStream is = cl.getResourceAsStream(path)) {
      if (is == null) {
        return List.of();
      }
      var root = yaml.readTree(is);
      if (root == null) {
        return List.of();
      }
      var node = root.has("types") ? root.get("types") : root;
      if (!node.isArray()) {
        return List.of();
      }
      var entries = new ArrayList<FieldTypeEntry>();
      for (var element : node) {
        var entry = entryOf(element, path);
        if (entry != null) {
          entries.add(entry);
        }
      }
      return entries;
    } catch (Exception e) {
      log.warn("Failed to read {}: {}", path, e.getMessage());
      return List.of();
    }
  }

  private String typeOf(ClassLoader cl, String path) {
    try (InputStream is = cl.getResourceAsStream(path)) {
      if (is == null) {
        return "";
      }
      var root = yaml.readTree(is);
      return root != null && root.isObject() && root.hasNonNull("type")
          ? root.get("type").asText()
          : "";
    } catch (Exception e) {
      return "";
    }
  }

  private FieldTypeEntry entryOf(JsonNode node, String path) {
    try {
      var entry = yaml.treeToValue(node, FieldTypeEntry.class);
      if (entry == null || entry.id() == null || entry.id().isBlank()) {
        log.warn("Ignoring a field type with no id in {}", path);
        return null;
      }
      return entry;
    } catch (Exception e) {
      log.warn(
          "Ignoring field type '{}' in {}: {}", node.path("id").asText("?"), path, e.getMessage());
      return null;
    }
  }

  private static ClassLoader classLoader() {
    var contextClassLoader = Thread.currentThread().getContextClassLoader();
    return contextClassLoader == null
        ? FieldTypeRegistry.class.getClassLoader()
        : contextClassLoader;
  }
}
