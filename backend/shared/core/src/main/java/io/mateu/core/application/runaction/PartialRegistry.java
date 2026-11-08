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
public final class PartialRegistry implements io.mateu.core.infra.dev.SpecsCache {

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

  private PartialRegistry() {
    // Dev mode: a spec changed — the YAML partials are read again (code registrations stay).
    io.mateu.core.infra.dev.DevSpecs.register(this);
  }

  @Override
  public void invalidateSpecs() {
    byRef.clear();
  }

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

  /**
   * The classpath paths a YAML partial {@code ref} may live at, in lookup order. A short name is
   * {@code specs/ui/partials/<ref>.yaml} (or {@code .yml}); an explicit {@code .yaml}/{@code .yml}
   * path is honoured as a classpath path ({@code specs/ui/partials/x.yaml}, leading slash ignored)
   * and, failing that, relative to {@code specs/ui/} — the spelling the .NET/Python ports, the
   * visual editor and the static bundle also accept, so one definition resolves everywhere.
   */
  public static List<String> candidatePaths(String ref) {
    if (ref == null || ref.isBlank()) {
      return List.of();
    }
    if (!isYamlPath(ref)) {
      return List.of("specs/ui/partials/" + ref + ".yaml", "specs/ui/partials/" + ref + ".yml");
    }
    var path = ref.replaceFirst("^(classpath:)?/+", "");
    return path.startsWith("specs/ui/") ? List.of(path) : List.of(path, "specs/ui/" + path);
  }

  /** Whether a ref names a file by path rather than by short name or class. */
  public static boolean isYamlPath(String ref) {
    return ref != null && (ref.endsWith(".yaml") || ref.endsWith(".yml"));
  }

  private List<Component> fromYaml(String ref) {
    var cl =
        io.mateu.core.infra.dev.DevSpecs.classLoader(
            Thread.currentThread().getContextClassLoader());
    var candidates = candidatePaths(ref);
    var path =
        candidates.stream()
            .filter(c -> cl.getResource(c) != null)
            .findFirst()
            .orElse(candidates.isEmpty() ? "" : candidates.get(0));
    String text = null;
    try (InputStream in = cl.getResourceAsStream(path)) {
      if (in == null) {
        log.warn("No partial definition for ref '{}' (looked for classpath:{})", ref, candidates);
        return NONE;
      }
      text = new String(in.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
      var root = FieldTypeRegistry.resolveWithAppTypes(mapper.readTree(text));
      if (root == null || root.isNull()) {
        return NONE;
      }
      if (root.has("content")) {
        // Each component is read on its own: one that cannot be read is reported (file, path,
        // reason) and left out, and the rest of the partial still renders.
        var content = new ArrayList<Component>();
        var children = root.get("content");
        for (int i = 0; i < children.size(); i++) {
          try {
            var component = mapper.treeToValue(children.get(i), Component.class);
            if (component != null) {
              content.add(component);
            }
          } catch (Exception e) {
            var located =
                com.fasterxml.jackson.databind.JsonMappingException.wrapWithPath(
                    com.fasterxml.jackson.databind.JsonMappingException.wrapWithPath(
                        e, children, i),
                    root,
                    "content");
            content.addAll(unreadable(ref, path, text, located));
          }
        }
        return List.copyOf(content);
      }
      var single = mapper.treeToValue(root, Component.class);
      return single == null ? NONE : List.of(single);
    } catch (Exception e) {
      return unreadable(ref, path, text, e);
    }
  }

  /**
   * A partial (or a component of it) that cannot be read: a WARN naming the file, the path inside
   * it and the reason — the same one-paragraph diagnosis a broken page definition gets — and, in
   * dev mode, a visible placeholder in its place. It used to vanish from the page, and the reason
   * was buried in a stack trace that did not say where in the file the problem was.
   */
  private static List<Component> unreadable(String ref, String path, String text, Exception error) {
    var problem = path + ", " + YamlSpecProblems.describeText(text, error);
    log.warn("Could not read the partial '{}': {}. It is left out of the page.", ref, problem);
    if (!io.mateu.core.infra.dev.DevMode.enabled()) {
      return NONE;
    }
    return List.of(
        io.mateu.uidl.data.Notice.builder()
            .theme("danger")
            .text("Could not read the partial " + problem)
            .build());
  }

  private List<Component> fromClass(String ref, HttpRequest httpRequest) {
    if (ref.indexOf('.') < 0 || isYamlPath(ref)) {
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
