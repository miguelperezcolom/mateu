package io.mateu.core.application.security;

import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.adapters.AdapterRegistry;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.ArrayList;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

/**
 * Decides whether a {@code serverSideType} that arrived on the wire may be resolved at all. The
 * client only ever sends back a type the server gave it, so the server accepts exactly the types
 * the application exposes — and nothing else is loaded, instantiated or asked of the container:
 *
 * <ol>
 *   <li><b>registered</b>: the routed classes ({@link RoutedClassProvider}s — every {@code @UI} and
 *       {@code @Route} the annotation processors generated), the {@code ui-registrations} index,
 *       the {@code viewModel}s of the route registry ({@code routes.yaml}, {@code
 *       RouteEntrySupplier}), the {@code modelView} of the request route's YAML page, and the types
 *       a {@code ComponentAdapter} is registered for;
 *   <li><b>reachable</b> from a registered type: the views it nests (fields), the rows of its cruds
 *       and listings (generic arguments), what its annotated methods return, its member classes —
 *       see {@link WireTypes#closure};
 *   <li><b>emitted</b>: a type this process itself put on the wire (an action returned it);
 *   <li><b>shaped like a view model</b>: a concrete application class that declares itself to Mateu
 *       (uidl annotations, a view-model interface, a framework orchestrator base class) — so a type
 *       an action returns keeps working after a restart or on another replica.
 * </ol>
 *
 * Library and platform classes, the framework's internals, interfaces and abstract classes (which a
 * container would answer with an arbitrary bean) are never accepted unless registered, and a type
 * the caller's token may not see ({@code @EyesOnly} on the class) is refused too. Anything else is
 * a {@link MateuForbiddenException} (HTTP 403) with a log line naming the type.
 */
@Slf4j
@Named
@Singleton
public class WireTypePolicy implements io.mateu.core.infra.dev.SpecsCache {

  private final BeanProvider beanProvider;
  private final RouteRegistry routeRegistry;
  private final YamlUidlLoader yamlUidlLoader;

  private volatile Set<String> registered;
  private volatile Set<String> reachable;

  @Inject
  public WireTypePolicy(
      BeanProvider beanProvider, RouteRegistry routeRegistry, YamlUidlLoader yamlUidlLoader) {
    this.beanProvider = beanProvider;
    this.routeRegistry = routeRegistry;
    this.yamlUidlLoader = yamlUidlLoader;
    io.mateu.core.infra.dev.DevSpecs.register(this);
  }

  /** Dev mode: a spec changed — the authored view models may be different ones now. */
  @Override
  public void invalidateSpecs() {
    registered = null;
    reachable = null;
  }

  /**
   * Validates the {@code serverSideType} of a request. Null/blank is fine (a plain route load);
   * anything else must be allowed, or a {@link MateuForbiddenException} is thrown.
   */
  public void check(String serverSideType, String route, HttpRequest httpRequest) {
    if (serverSideType == null || serverSideType.isEmpty()) {
      return;
    }
    if (!isAllowed(serverSideType, route)) {
      log.warn(
          "Refused request: serverSideType '{}' is not a type this application exposes (route {})",
          abbreviate(serverSideType),
          route);
      throw new MateuForbiddenException(
          "serverSideType not allowed: " + abbreviate(serverSideType));
    }
    var type = WireTypes.loadWithoutInit(serverSideType);
    if (type != null && !classLevelAccessGranted(type, httpRequest)) {
      log.warn(
          "Refused request: serverSideType '{}' is @EyesOnly and the caller's token does not satisfy"
              + " it",
          serverSideType);
      throw new MateuForbiddenException("serverSideType not allowed for caller: " + serverSideType);
    }
  }

  /** Whether {@code className}, sent by a client, names a type the application exposes. */
  public boolean isAllowed(String className, String route) {
    if (!WireTypes.isBinaryName(className)) {
      return false;
    }
    if (registered().contains(className)) {
      return true;
    }
    if (isYamlModelView(className, route) || AdapterRegistry.findByTypeName(className) != null) {
      return true;
    }
    if (WireTypes.isDeniedPackage(className)) {
      return false;
    }
    if (WireTypes.wasEmitted(className) || reachable().contains(className)) {
      return true;
    }
    var type = WireTypes.loadWithoutInit(className);
    if (type == null) {
      return false;
    }
    return WireTypes.isViewModelShaped(type) && !WireTypes.isServiceStereotyped(type);
  }

  /** A class-level {@code @EyesOnly} the caller does not satisfy refuses the whole type. */
  static boolean classLevelAccessGranted(Class<?> type, HttpRequest httpRequest) {
    for (Class<?> c = type; c != null && c != Object.class; c = c.getEnclosingClass()) {
      var eyesOnly = io.mateu.core.infra.reflection.MetaAnnotations.find(c, EyesOnly.class);
      if (eyesOnly != null
          && !io.mateu.core.domain.Authorizer.isAuthorized(eyesOnly, httpRequest)) {
        return false;
      }
    }
    return true;
  }

  private boolean isYamlModelView(String className, String route) {
    if (route == null) {
      return false;
    }
    try {
      var q = route.indexOf('?');
      var path = q >= 0 ? route.substring(0, q) : route;
      var spec = yamlUidlLoader.loadSpec(path);
      return spec != null && className.equals(spec.modelView());
    } catch (RuntimeException e) {
      return false;
    }
  }

  /** The registered types — computed once. */
  Set<String> registered() {
    var loaded = registered;
    if (loaded == null) {
      synchronized (this) {
        loaded = registered;
        if (loaded == null) {
          loaded = computeRegistered();
          registered = loaded;
        }
      }
    }
    return loaded;
  }

  /** The types reachable from the registered ones — computed once. */
  Set<String> reachable() {
    var loaded = reachable;
    if (loaded == null) {
      synchronized (this) {
        loaded = reachable;
        if (loaded == null) {
          var roots = new ArrayList<Class<?>>();
          for (var name : registered()) {
            var type = WireTypes.loadWithoutInit(name);
            if (type != null) {
              roots.add(type);
            }
          }
          loaded = Set.copyOf(WireTypes.closure(roots));
          reachable = loaded;
        }
      }
    }
    return loaded;
  }

  private Set<String> computeRegistered() {
    var out = new java.util.LinkedHashSet<String>();
    try {
      for (var provider : beanProvider.getBeans(RoutedClassProvider.class)) {
        try {
          var routed = provider.routedClass();
          if (routed != null) {
            out.add(routed.getName());
          }
        } catch (Throwable t) {
          log.debug("skipping routed class provider {}: {}", provider.getClass(), t.toString());
        }
      }
    } catch (RuntimeException e) {
      log.debug("no routed class providers: {}", e.toString());
    }
    try {
      var cl = Thread.currentThread().getContextClassLoader();
      out.addAll(RouteRegistrations.classes(cl != null ? cl : getClass().getClassLoader()));
    } catch (RuntimeException e) {
      log.debug("no ui-registrations index: {}", e.toString());
    }
    try {
      for (var entry : routeRegistry.table().routes()) {
        if (entry.viewModel() != null && !entry.viewModel().isBlank()) {
          out.add(entry.viewModel().trim());
        }
      }
    } catch (RuntimeException e) {
      log.debug("no route registry: {}", e.toString());
    }
    log.debug("wire type allowlist: {} registered types", out.size());
    return Set.copyOf(out);
  }

  private static String abbreviate(String s) {
    return s.length() > 200 ? s.substring(0, 200) + "…" : s;
  }
}
