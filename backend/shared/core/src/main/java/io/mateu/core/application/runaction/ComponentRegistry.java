package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.BusinessComponent;
import io.mateu.uidl.data.ComponentCatalog;
import io.mateu.uidl.data.ComponentEntry;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentCatalogSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * The app's catalogue of named business components (coherence-plan #13): a reusable BOUND
 * composition declared ONCE and referenced by name from any surface. The exact twin of {@link
 * RestSourceRegistry}, one level up — a source names an ENDPOINT, a business component names a
 * COMPOSITION.
 *
 * <p>Two producers feed one catalogue, the pattern the route registry and the source catalogue
 * follow: the DERIVED half is whatever {@link ComponentCatalogSupplier} beans contribute at
 * runtime; the AUTHORED half is a {@code specs/ui/components.yaml}, merged on top. <b>Authored
 * wins.</b>
 *
 * <p>The {@code @BusinessComponent} annotation on a field / no-arg method of a registered routed
 * class is the code-first producer, part of the derived half (supplier beans win over it). Unlike a
 * {@code @RestSource}, whose whole descriptor lives in annotation attributes, its VALUE lives in
 * the member — a static member is read directly, an instance member through a fresh instance built
 * with the class's no-arg constructor (no DI: a composition is data, it should not need a service).
 */
@Named
@Singleton
@Slf4j
public class ComponentRegistry {

  /** The conventional authored catalogue. */
  static final String CONVENTIONAL_COMPONENTS = "specs/ui/components.yaml";

  /**
   * The polymorphic mapper that deserialises an authored component tree into a fluent Component.
   */
  private final ObjectMapper yaml = YamlUidlMapperFactory.create();

  private volatile ComponentCatalog catalog;

  /** The merged catalogue (authored over derived), loaded once. */
  public ComponentCatalog catalog() {
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
  public Optional<ComponentEntry> get(String name) {
    return catalog().get(name);
  }

  ComponentCatalog load(ClassLoader classLoader) {
    var derived = derivedFrom(classLoader);
    var authored = authoredFrom(classLoader);
    var merged = authored.mergedOver(derived);
    if (!merged.hasNoComponents()) {
      log.info(
          "Component catalogue: {} business component(s) ({} derived, {} authored)",
          merged.components().size(),
          derived.components().size(),
          authored.components().size());
    }
    return merged;
  }

  /**
   * The derived half: the {@code @BusinessComponent} members of every registered routed class, then
   * whatever {@link ComponentCatalogSupplier} beans contribute (a bean wins over an annotation of
   * the same name).
   */
  ComponentCatalog derivedFrom(ClassLoader classLoader) {
    var byName = new LinkedHashMap<String, ComponentEntry>();
    var cl = classLoader == null ? ComponentRegistry.class.getClassLoader() : classLoader;
    for (var className : RouteRegistrations.classes(cl)) {
      Class<?> viewClass;
      try {
        viewClass = Class.forName(className, false, cl);
      } catch (Throwable t) {
        log.debug("Component catalogue: skipping {} ({})", className, t.toString());
        continue;
      }
      for (var entry : annotatedOn(viewClass)) {
        byName.put(entry.name(), entry);
      }
    }
    for (var entry : fromSupplierBeans()) {
      byName.put(entry.name(), entry);
    }
    return new ComponentCatalog(List.copyOf(byName.values()));
  }

  /**
   * The {@code @BusinessComponent} members of one class, as catalogue entries. A member whose value
   * is not a {@link Component} (or null, or unreadable) contributes nothing and is logged — a
   * broken entry must not take the whole catalogue down.
   */
  static List<ComponentEntry> annotatedOn(Class<?> type) {
    var entries = new ArrayList<ComponentEntry>();
    Object[] instance = {null};
    boolean[] instantiated = {false};
    java.util.function.Supplier<Object> target =
        () -> {
          if (!instantiated[0]) {
            instantiated[0] = true;
            try {
              var constructor = type.getDeclaredConstructor();
              constructor.setAccessible(true);
              instance[0] = constructor.newInstance();
            } catch (Throwable t) {
              log.warn(
                  "Component catalogue: cannot instantiate {} to read its @BusinessComponent"
                      + " members ({}) — give it a no-arg constructor or make the member static",
                  type.getName(),
                  t.toString());
            }
          }
          return instance[0];
        };
    for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      for (Field field : c.getDeclaredFields()) {
        var declared = MetaAnnotations.find(field, BusinessComponent.class);
        if (declared == null) {
          continue;
        }
        try {
          field.setAccessible(true);
          var owner = Modifier.isStatic(field.getModifiers()) ? null : target.get();
          if (owner == null && !Modifier.isStatic(field.getModifiers())) {
            continue;
          }
          add(entries, declared, field.get(owner), type, field.getName());
        } catch (Throwable t) {
          log.warn("Component catalogue: cannot read {}.{} ({})", type.getName(), field, t);
        }
      }
      for (Method method : c.getDeclaredMethods()) {
        var declared = MetaAnnotations.find(method, BusinessComponent.class);
        if (declared == null || method.getParameterCount() > 0) {
          continue;
        }
        try {
          method.setAccessible(true);
          var owner = Modifier.isStatic(method.getModifiers()) ? null : target.get();
          if (owner == null && !Modifier.isStatic(method.getModifiers())) {
            continue;
          }
          add(entries, declared, method.invoke(owner), type, method.getName());
        } catch (Throwable t) {
          log.warn("Component catalogue: cannot invoke {}.{} ({})", type.getName(), method, t);
        }
      }
    }
    return entries;
  }

  private static void add(
      List<ComponentEntry> entries,
      BusinessComponent declared,
      Object value,
      Class<?> type,
      String member) {
    if (declared.value() == null || declared.value().isBlank()) {
      return;
    }
    if (value instanceof Component component) {
      entries.add(new ComponentEntry(declared.value(), component));
    } else {
      log.warn(
          "Component catalogue: @BusinessComponent(\"{}\") on {}.{} is not a Component ({})",
          declared.value(),
          type.getName(),
          member,
          value == null ? "null" : value.getClass().getName());
    }
  }

  private List<ComponentEntry> fromSupplierBeans() {
    try {
      var beans = MateuBeanProvider.getBeans(ComponentCatalogSupplier.class);
      if (beans == null) {
        return List.of();
      }
      var entries = new ArrayList<ComponentEntry>();
      for (var bean : beans) {
        var contributed = bean.businessComponents();
        if (contributed != null) {
          contributed.stream().filter(e -> e != null && !e.name().isBlank()).forEach(entries::add);
        }
      }
      return entries;
    } catch (Throwable t) {
      // No bean provider yet (build-time export, a bare unit test) — the authored half stands on
      // its own, so this is not worth failing over.
      log.debug("Component catalogue: no supplier beans available ({})", t.toString());
      return List.of();
    }
  }

  /**
   * The authored half: {@code specs/ui/components.yaml}, either a {@code components:} envelope or a
   * bare array; each entry is {@code {name, component}} with the component a fluent tree.
   */
  public ComponentCatalog authoredFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? ComponentRegistry.class.getClassLoader() : classLoader;
    try (InputStream is = cl.getResourceAsStream(CONVENTIONAL_COMPONENTS)) {
      if (is == null) {
        return ComponentCatalog.empty();
      }
      var root = yaml.readTree(is);
      if (root == null) {
        return ComponentCatalog.empty();
      }
      var node = root.has("components") ? root.get("components") : root;
      if (!node.isArray()) {
        return ComponentCatalog.empty();
      }
      var entries = new ArrayList<ComponentEntry>();
      for (var element : node) {
        var entry = entryOf(element);
        if (entry != null) {
          entries.add(entry);
        }
      }
      return new ComponentCatalog(entries);
    } catch (Exception e) {
      log.warn("Failed to read {}: {}", CONVENTIONAL_COMPONENTS, e.getMessage());
      return ComponentCatalog.empty();
    }
  }

  /** One authored YAML entry ({@code {name, component}}) as a catalogue entry. */
  private ComponentEntry entryOf(com.fasterxml.jackson.databind.JsonNode element) {
    if (element == null || !element.isObject()) {
      return null;
    }
    var nameNode = element.get("name");
    if (nameNode == null || nameNode.asText().isBlank()) {
      return null;
    }
    var componentNode = element.get("component");
    if (componentNode == null || componentNode.isNull()) {
      return null;
    }
    try {
      var component = yaml.treeToValue(componentNode, Component.class);
      return new ComponentEntry(nameNode.asText(), component);
    } catch (Exception e) {
      log.warn(
          "components.yaml: could not parse component '{}': {}", nameNode.asText(), e.getMessage());
      return null;
    }
  }

  private static ClassLoader classLoader() {
    var contextClassLoader = Thread.currentThread().getContextClassLoader();
    return contextClassLoader == null
        ? ComponentRegistry.class.getClassLoader()
        : contextClassLoader;
  }
}
