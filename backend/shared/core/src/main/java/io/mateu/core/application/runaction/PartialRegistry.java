package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.application.security.YamlAccess;
import io.mateu.uidl.di.MateuBeanProvider;
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

  /**
   * The source tree of a YAML partial that depends on who asks or in which language (it declares
   * access keys or mentions {@code ${i18n.…}}). Such a partial is never served from {@link #byRef}:
   * it is re-derived per request — access keys applied for the caller, texts translated — exactly
   * as when a YAML page pulls it in ({@code YamlPartials} composes it into the page tree before
   * {@code YamlUidlLoader} applies them). Without this, a partial drawn inside a JAVA page reached
   * every caller with its {@code eyesOnly:} sections intact.
   */
  private final ConcurrentHashMap<String, JsonNode> requestDependent = new ConcurrentHashMap<>();

  /**
   * The source tree of every YAML partial read, request-dependent or not: what {@link
   * #sourceOf(String)} hands the write-side guard, which derives the fields a partial locks for a
   * caller (and follows the partials it nests) without rendering it.
   */
  private final ConcurrentHashMap<String, JsonNode> sources = new ConcurrentHashMap<>();

  private final TranslationRegistry fallbackTranslations = new TranslationRegistry();
  private final ConcurrentHashMap<String, List<Component>> registered = new ConcurrentHashMap<>();

  private PartialRegistry() {
    // Dev mode: a spec changed — the YAML partials are read again (code registrations stay).
    io.mateu.core.infra.dev.DevSpecs.register(this);
  }

  @Override
  public void invalidateSpecs() {
    byRef.clear();
    requestDependent.clear();
    sources.clear();
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
    requestDependent.clear();
    sources.clear();
  }

  /**
   * The authored YAML tree {@code ref} stands for, BEFORE any access key is applied (a copy), or
   * {@code null} when the ref is not a YAML partial (registered in code, a class, or missing). For
   * the write-side guard ({@code ClientLockedFields}): the fields a partial locks for a caller are
   * derived from it.
   */
  public JsonNode sourceOf(String ref) {
    if (ref == null || ref.isBlank() || registered.containsKey(ref)) {
      return null;
    }
    byRef.computeIfAbsent(ref, this::fromYaml);
    var source = sources.get(ref);
    return source == null ? null : source.deepCopy();
  }

  /**
   * The components a partial registered in code, or authored as a Java class, stands for; {@code
   * null} for a YAML (or missing) one.
   */
  public List<Component> codeComponentsOf(String ref, HttpRequest httpRequest) {
    if (ref == null || ref.isBlank()) {
      return null;
    }
    var fromCode = registered.get(ref);
    return fromCode != null ? fromCode : fromClass(ref, httpRequest);
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
    var shared = byRef.computeIfAbsent(ref, this::fromYaml);
    var source = requestDependent.get(ref);
    return source == null ? shared : personalised(ref, source, httpRequest);
  }

  /**
   * A request-dependent partial as {@code httpRequest} sees it. Who may see what is decided first,
   * and a failure there renders NOTHING of the partial: an unrestricted version would hand the
   * caller exactly what the access keys take away.
   */
  private List<Component> personalised(String ref, JsonNode source, HttpRequest httpRequest) {
    JsonNode tree;
    try {
      tree =
          YamlAccess.declaresAccess(source)
              ? YamlAccess.apply(source, httpRequest, routeReachability(httpRequest)).tree()
              : source.deepCopy();
    } catch (Exception e) {
      log.error("Could not apply the access keys of partial '{}'; rendering nothing", ref, e);
      return NONE;
    }
    if (tree == null || tree.isNull() || tree.isMissingNode()) {
      return NONE; // the whole partial is hidden from this caller
    }
    if (!TranslationRegistry.isRaw(httpRequest)) {
      try {
        translations().translateTree(tree, TranslationRegistry.localeOf(httpRequest));
      } catch (Exception e) {
        log.warn("Could not translate partial '{}' (served untranslated): {}", ref, e.getMessage());
      }
    }
    try {
      return componentsOf(tree);
    } catch (Exception e) {
      log.error("Could not build partial '{}' for the request", ref, e);
      return NONE;
    }
  }

  private static java.util.function.Predicate<String> routeReachability(HttpRequest httpRequest) {
    try {
      var routes = MateuBeanProvider.getSingletonBean(RouteRegistry.class);
      return routes == null ? null : path -> routes.isReachable(path, httpRequest);
    } catch (Throwable t) {
      return null;
    }
  }

  private TranslationRegistry translations() {
    try {
      var bean = MateuBeanProvider.getSingletonBean(TranslationRegistry.class);
      if (bean != null) {
        return bean;
      }
    } catch (Throwable ignored) {
      // no bean context (a bare test, a build-time export): our own reader of the same files
    }
    return fallbackTranslations;
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
    try (InputStream in = cl.getResourceAsStream(path)) {
      if (in == null) {
        log.warn("No partial definition for ref '{}' (looked for classpath:{})", ref, candidates);
        return NONE;
      }
      var root = FieldTypeRegistry.resolveWithAppTypes(mapper.readTree(in));
      if (root == null || root.isNull()) {
        return NONE;
      }
      sources.put(ref, root.deepCopy());
      if (YamlAccess.declaresAccess(root) || TranslationRegistry.mentionsI18n(root)) {
        // re-derived per request (resolve → personalised); no shared version exists to leak
        requestDependent.put(ref, root);
        return NONE;
      }
      return componentsOf(root);
    } catch (Exception e) {
      log.error("Could not read partial '{}' from classpath:{}", ref, path, e);
      return NONE;
    }
  }

  private List<Component> componentsOf(JsonNode root) throws Exception {
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
