package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import io.mateu.uidl.data.ActionCatalog;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.ActionCatalogSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

/**
 * The app's catalogue of named, client-runnable ACTIONS — flows ({@code steps}) and REST actions
 * ({@code restAction}) declared once and run by id from the shell menu or any page. The twin of
 * {@link RestSourceRegistry}, one notch over: a source names an ENDPOINT, an entry here names
 * something to DO.
 *
 * <p>Two producers feed one table: the DERIVED half is whatever {@link ActionCatalogSupplier} beans
 * contribute; the AUTHORED half is {@code specs/ui/actions.yaml} plus any other {@code type:
 * Actions} file under {@code specs/ui}, merged on top. <b>Authored wins</b>, replacing outright.
 * Ids are GLOBAL — one table per deployment, not per mount.
 *
 * <p>Resolution is OWNER FIRST: a page's own {@code actions:} (or a Java action method), the
 * shell's own {@code actions:}, then this catalogue, then — unchanged — a server action. The
 * catalogue fills gaps; it never overrides what an owner declares.
 *
 * <p>Only client-runnable entries are accepted. An entry with neither steps nor a restAction would
 * be server logic, which stays an {@code @Action} method; it is dropped with a WARN at load.
 *
 * <p>Never fails: a broken file logs and yields fewer entries, not an outage.
 */
@Slf4j
@Named
@Singleton
public class ActionRegistry {

  /** The conventional authored catalogue. */
  static final String CONVENTIONAL_ACTIONS = "specs/ui/actions.yaml";

  /** The {@code type:} that marks any file under {@code specs/ui} as an action catalogue. */
  static final String TYPE = "Actions";

  private final ObjectMapper yaml = YamlUidlMapperFactory.create();

  private volatile ActionCatalog catalog;

  /** The merged catalogue (authored over derived), loaded once. */
  public ActionCatalog catalog() {
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

  /** The entry an id names, or empty when the catalogue does not carry it. */
  public Optional<Action> get(String id) {
    return catalog().get(id);
  }

  ActionCatalog load(ClassLoader classLoader) {
    var derived = new ActionCatalog(clientRunnableOnly(fromSupplierBeans(), "a supplier bean"));
    var authored = authoredFrom(classLoader);
    var merged = authored.mergedOver(derived);
    if (!merged.hasNoActions()) {
      log.info(
          "Action catalogue: {} action(s) ({} derived, {} authored)",
          merged.actions().size(),
          derived.actions().size(),
          authored.actions().size());
    }
    return merged;
  }

  private List<Action> fromSupplierBeans() {
    try {
      var beans = MateuBeanProvider.getBeans(ActionCatalogSupplier.class);
      if (beans == null) {
        return List.of();
      }
      var entries = new ArrayList<Action>();
      for (var bean : beans) {
        var contributed = bean.actionCatalog();
        if (contributed != null) {
          contributed.stream()
              .filter(a -> a != null && a.id() != null && !a.id().isBlank())
              .forEach(entries::add);
        }
      }
      return entries;
    } catch (Throwable t) {
      // No bean provider (build-time export, a bare unit test): the authored half stands alone.
      log.debug("Action catalogue: no supplier beans available ({})", t.toString());
      return List.of();
    }
  }

  /**
   * The authored half: the conventional {@code specs/ui/actions.yaml} (with or without a {@code
   * type:} header) and every other file under {@code specs/ui} declaring {@code type: Actions}, in
   * discovery order — a later file's entry replaces an earlier one of the same id. Each file is an
   * {@code actions:} envelope (or a bare list) of entries shaped exactly like a page definition's
   * {@code actions:}.
   */
  public ActionCatalog authoredFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? ActionRegistry.class.getClassLoader() : classLoader;
    var files = new LinkedHashSet<String>();
    if (cl.getResource(CONVENTIONAL_ACTIONS) != null) {
      files.add(CONVENTIONAL_ACTIONS);
    }
    for (var path : new MountRegistry().scanYamlResourcePaths(cl)) {
      if (!path.equals(CONVENTIONAL_ACTIONS) && TYPE.equals(typeOf(cl, path))) {
        files.add(path);
      }
    }
    var byId = new LinkedHashMap<String, Action>();
    for (var file : files) {
      for (var action : read(cl, file)) {
        byId.put(action.id(), action);
      }
    }
    return new ActionCatalog(List.copyOf(byId.values()));
  }

  private List<Action> read(ClassLoader cl, String path) {
    try (InputStream is = cl.getResourceAsStream(path)) {
      if (is == null) {
        return List.of();
      }
      JsonNode root = yaml.readTree(is);
      if (root == null) {
        return List.of();
      }
      JsonNode envelope = root;
      if (root.isArray()) {
        envelope = yaml.createObjectNode().set("actions", root);
      }
      var parsed = new ArrayList<Action>();
      for (var action : YamlUidlLoader.actionsOf(yaml, envelope)) {
        if (action.id() == null || action.id().isBlank()) {
          log.warn("Ignoring an action with no id in {}", path);
          continue;
        }
        parsed.add(action);
      }
      return clientRunnableOnly(parsed, path);
    } catch (Exception e) {
      log.warn("Failed to read action catalogue {}: {}", path, e.getMessage());
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

  /** Drops (with a WARN naming it) every entry that would need a server to run. */
  static List<Action> clientRunnableOnly(List<Action> actions, String origin) {
    var accepted = new ArrayList<Action>();
    for (var action : actions) {
      if (ActionCatalog.clientRunnable(action)) {
        accepted.add(action);
      } else {
        log.warn(
            "Action catalogue: '{}' in {} is not client-runnable (it has neither steps nor a"
                + " restAction) and is ignored — server logic stays an @Action method",
            action.id(),
            origin);
      }
    }
    return accepted;
  }

  // ---------------------------------------------------------------------------------------------
  // Resolution against an owner
  // ---------------------------------------------------------------------------------------------

  private static final ObjectMapper TREE =
      new ObjectMapper().disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  /**
   * The catalogue entries an owner needs to carry: every id its component tree (and its own
   * actions' flows) references that it does NOT own, closed transitively over the catalogue (a
   * catalogue flow whose {@code RunAction} names another entry brings that one too). Owner first:
   * an id in {@code owned} is never replaced.
   */
  public List<Action> referencedBy(Object tree, Collection<Action> ownActions, Set<String> owned) {
    var catalogue = catalog();
    if (catalogue.hasNoActions()) {
      return List.of();
    }
    var ids = new LinkedHashSet<String>();
    collectIds(toTree(tree), ids);
    if (ownActions != null) {
      ownActions.forEach(action -> collectIds(toTree(action), ids));
    }
    var known = new LinkedHashSet<String>(owned == null ? Set.of() : owned);
    var found = new ArrayList<Action>();
    var pending = new ArrayList<>(ids);
    while (!pending.isEmpty()) {
      var id = pending.remove(0);
      if (known.contains(id)) {
        continue;
      }
      var entry = catalogue.get(id);
      if (entry.isEmpty()) {
        continue;
      }
      known.add(id);
      found.add(entry.get());
      var nested = new LinkedHashSet<String>();
      collectIds(toTree(entry.get()), nested);
      pending.addAll(nested);
    }
    return found;
  }

  private static JsonNode toTree(Object value) {
    if (value == null) {
      return null;
    }
    try {
      return TREE.valueToTree(value);
    } catch (Throwable t) {
      // A tree that does not serialise (a holder field, a lambda) simply references nothing here.
      return null;
    }
  }

  /** Every textual {@code actionId} / {@code *ActionId} value in a JSON tree. */
  static void collectIds(JsonNode node, Set<String> out) {
    if (node == null) {
      return;
    }
    if (node.isObject()) {
      node.fields()
          .forEachRemaining(
              field -> {
                var name = field.getKey();
                var value = field.getValue();
                if (value.isTextual()
                    && (name.equals("actionId") || name.endsWith("ActionId"))
                    && !value.asText().isBlank()) {
                  out.add(value.asText());
                } else {
                  collectIds(value, out);
                }
              });
    } else if (node.isArray()) {
      node.forEach(child -> collectIds(child, out));
    }
  }

  private static ClassLoader classLoader() {
    var contextClassLoader = Thread.currentThread().getContextClassLoader();
    return contextClassLoader == null ? ActionRegistry.class.getClassLoader() : contextClassLoader;
  }
}
