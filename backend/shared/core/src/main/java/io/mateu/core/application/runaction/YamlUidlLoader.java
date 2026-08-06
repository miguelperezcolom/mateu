package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.fluent.Component;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Loads a page defined in a YAML file under {@code specs/ui/} on the classpath.
 *
 * <p>Two shapes are supported:
 *
 * <ul>
 *   <li><b>Bare layout</b> (legacy): the whole file is a component tree ({@code type: ...}). It
 *       renders as a static, unbound page — good for help/landing screens with no behaviour.
 *   <li><b>Page envelope</b>: a {@code layout:} key holds the component tree and an optional {@code
 *       modelView:} key names a Java class. When present, that class is instantiated as the page's
 *       ModelView — it supplies the state, actions, validations and rules — while the YAML supplies
 *       the layout. This is the inverse of {@code @UISpec} (there the class points at the YAML;
 *       here the YAML points at the class), so a page can be authored as a file that references a
 *       plain, unannotated logic class.
 * </ul>
 *
 * The binding between the YAML layout and the ModelView is by convention, exactly as everywhere
 * else in Mateu: a {@code FormField id="name"} binds to the ModelView's {@code name} property and a
 * {@code Button actionId="save"} to its {@code save()} method.
 */
@Slf4j
@Named
@Singleton
public class YamlUidlLoader {

  /** A parsed page spec: the layout, plus the ModelView class name when the YAML declares one. */
  public record YamlPageSpec(String modelView, Component layout) {}

  // Specs are static files, so parse once and cache by (normalized) route. A miss is cached as
  // NONE so an unmatched route — checked on every request that has no Java class — doesn't hit the
  // classpath each time. (Editing a YAML during development needs a restart to be picked up.)
  private static final YamlPageSpec NONE = new YamlPageSpec(null, null);

  private final ObjectMapper mapper;
  private final ConcurrentHashMap<String, YamlPageSpec> byRoute = new ConcurrentHashMap<>();

  public YamlUidlLoader() {
    mapper = YamlUidlMapperFactory.create();
  }

  /** Load a layout from an explicit spec path (the {@code @UISpec} path); envelope-aware. */
  public Component loadFromSpec(String specPath) {
    var resource = resolve(specPath);
    if (resource == null) {
      log.warn("No YAML spec found at classpath:{}", specPath);
      return null;
    }
    try (var is = resource) {
      return layoutOf(mapper.readTree(is));
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", specPath, e.getMessage());
      return null;
    }
  }

  /**
   * The parsed spec for a route ({@code specs/ui/<route>.yaml}), or {@code null} when there is
   * none.
   */
  public YamlPageSpec loadSpec(String route) {
    var spec = byRoute.computeIfAbsent(normalize(route), this::parseSpec);
    return spec == NONE ? null : spec;
  }

  /**
   * The YAML layout for {@code route}, but only when the route's spec declares {@code modelView}
   * and it matches {@code modelViewClass} — i.e. this instance IS the page's declared ModelView.
   * This is what re-applies the YAML layout on an action round-trip (which routes by
   * serverSideType), not just on the first load. Returns {@code null} otherwise.
   */
  public Component layoutForRoute(String route, Class<?> modelViewClass) {
    var spec = loadSpec(route);
    if (spec == null || spec.modelView() == null || modelViewClass == null) {
      return null;
    }
    return spec.modelView().equals(modelViewClass.getName()) ? spec.layout() : null;
  }

  private YamlPageSpec parseSpec(String normalizedRoute) {
    var yamlPath = "specs/ui/" + normalizedRoute + ".yaml";
    var resource = resolve(yamlPath);
    if (resource == null) {
      log.info("No YAML spec found at {}", yamlPath);
      return NONE;
    }
    try (var is = resource) {
      var root = mapper.readTree(is);
      if (root == null) {
        return NONE;
      }
      var modelView = root.hasNonNull("modelView") ? root.get("modelView").asText() : null;
      var layout = layoutOf(root);
      log.info("Loaded YAML spec {} (modelView={})", yamlPath, modelView);
      return new YamlPageSpec(modelView, layout);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", yamlPath, e.getMessage());
      return NONE;
    }
  }

  /**
   * The component tree of a parsed doc: the {@code layout:} node in an envelope, else the whole
   * doc.
   */
  private Component layoutOf(JsonNode root) throws Exception {
    if (root == null) {
      return null;
    }
    var node = root.has("layout") ? root.get("layout") : root;
    return mapper.treeToValue(node, Component.class);
  }

  private InputStream resolve(String path) {
    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl != null ? cl.getResourceAsStream(path) : null;
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(path);
    }
    return resource;
  }

  private String normalize(String route) {
    var r = route == null ? "" : route;
    int idx = r.indexOf('?');
    if (idx >= 0) {
      r = r.substring(0, idx);
    }
    while (r.startsWith("/")) {
      r = r.substring(1);
    }
    return r;
  }
}
