package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Resolves a {@link io.mateu.uidl.data.Partial}'s {@code ref} into the components it stands for.
 *
 * <p>A partial definition is authored the same way a page is, and this is where the two authoring
 * paths meet:
 *
 * <ul>
 *   <li><b>YAML</b> — {@code specs/ui/partials/<ref>.yaml}, holding either a bare component ({@code
 *       type: ...}) or a {@code content:} list of them. An explicit classpath path ending in {@code
 *       .yaml} is honoured as-is, so a partial can live next to the pages that use it.
 *   <li><b>Java</b> — {@code ref} as a fully-qualified class name. A {@link ComponentTreeSupplier}
 *       contributes its tree; a plain {@link Component} contributes itself.
 * </ul>
 *
 * <p>A ref that resolves to nothing is <b>not</b> fatal. A missing partial renders as no content
 * and logs; a page is not worth taking down over one piece of it, and the alternative — a 500 on
 * every request to every page that mentions the ref — turns a typo into an outage.
 *
 * <p>This is a static singleton rather than a bean because the mappers that need it are static and
 * reached from several entry points. Nothing about it is per-request: definitions are files.
 */
@Slf4j
public final class PartialRegistry {

  private static final PartialRegistry INSTANCE = new PartialRegistry();

  public static PartialRegistry instance() {
    return INSTANCE;
  }

  /**
   * Resolution misses are cached too — a page mentioning a bad ref would otherwise hit the
   * classpath on every request forever.
   */
  private static final List<Component> NONE = List.of();

  private final ObjectMapper mapper = YamlUidlMapperFactory.create();
  private final ConcurrentHashMap<String, List<Component>> byRef = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, List<Component>> registered = new ConcurrentHashMap<>();

  private PartialRegistry() {}

  /**
   * Contribute a partial programmatically. For tests, and for apps that build their shared pieces
   * in code rather than in files. A registration wins over a file of the same name — the same
   * precedence a route registration has over the {@code specs/ui/<route>.yaml} convention.
   */
  public void register(String ref, List<Component> content) {
    registered.put(ref, List.copyOf(content));
    byRef.remove(ref);
  }

  /** Forget everything registered programmatically, and every cached lookup. Tests. */
  public void reset() {
    registered.clear();
    byRef.clear();
  }

  /** The components {@code ref} stands for; empty when it resolves to nothing. */
  public List<Component> resolve(String ref, HttpRequest httpRequest) {
    if (ref == null || ref.isBlank()) {
      return NONE;
    }
    var fromCode = registered.get(ref);
    if (fromCode != null) {
      return fromCode;
    }
    // Class refs are resolved on every call: a ComponentTreeSupplier may legitimately return a
    // different tree per request, which is the whole reason to author a partial in Java.
    var fromClass = fromClass(ref, httpRequest);
    if (fromClass != null) {
      return fromClass;
    }
    return byRef.computeIfAbsent(ref, this::fromYaml);
  }

  private List<Component> fromYaml(String ref) {
    var path =
        ref.endsWith(".yaml") || ref.endsWith(".yml") ? ref : "specs/ui/partials/" + ref + ".yaml";
    try (InputStream in =
        Thread.currentThread().getContextClassLoader().getResourceAsStream(path)) {
      if (in == null) {
        log.warn("No partial definition for ref '{}' (looked for classpath:{})", ref, path);
        return NONE;
      }
      var root = mapper.readTree(in);
      if (root == null || root.isNull()) {
        return NONE;
      }
      if (root.has("content")) {
        var content = new ArrayList<Component>();
        for (var child : root.get("content")) {
          var component = mapper.treeToValue(child, Component.class);
          if (component != null) {
            content.add(component);
          }
        }
        return List.copyOf(content);
      }
      var single = mapper.treeToValue(root, Component.class);
      return single == null ? NONE : List.of(single);
    } catch (Exception e) {
      log.error("Could not read partial '{}' from classpath:{}", ref, path, e);
      return NONE;
    }
  }

  private List<Component> fromClass(String ref, HttpRequest httpRequest) {
    if (ref.indexOf('.') < 0 || ref.endsWith(".yaml") || ref.endsWith(".yml")) {
      return null;
    }
    try {
      var type = Class.forName(ref, true, Thread.currentThread().getContextClassLoader());
      var instance = type.getDeclaredConstructor().newInstance();
      if (instance instanceof ComponentTreeSupplier supplier) {
        var tree = supplier.component(httpRequest);
        return tree == null ? NONE : List.of(tree);
      }
      if (instance instanceof Component component) {
        return List.of(component);
      }
      log.warn(
          "Partial ref '{}' names a class that is neither a Component nor a ComponentTreeSupplier",
          ref);
      return NONE;
    } catch (ClassNotFoundException e) {
      // Not a class ref at all — a dotted YAML name is perfectly legal. Fall through to the file.
      return null;
    } catch (Exception e) {
      log.error("Could not build partial from class '{}'", ref, e);
      return NONE;
    }
  }
}
