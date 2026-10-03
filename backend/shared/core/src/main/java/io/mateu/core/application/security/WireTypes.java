package io.mateu.core.application.security;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.lang.reflect.WildcardType;
import java.util.ArrayDeque;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * The static half of the wire-type allowlist (see {@link WireTypePolicy}): which classes are shaped
 * like a Mateu view model, which ones are reachable from a registered one, and which names this
 * process has itself put on the wire.
 *
 * <p>Everything here inspects classes WITHOUT initializing them (no static initializer runs for a
 * name a client sent), and never asks the DI container for anything.
 */
public final class WireTypes {

  private WireTypes() {}

  /** A Java binary class name — anything else is rejected before any class loading. */
  private static final Pattern BINARY_NAME =
      Pattern.compile("[\\p{L}_$][\\p{L}\\p{N}_$]*(\\.[\\p{L}_$][\\p{L}\\p{N}_$]*)*");

  /**
   * Libraries and platforms: never a view model, whatever path reaches them. Matched as prefixes of
   * the class name.
   */
  private static final List<String> DENIED_PREFIXES =
      List.of(
          "java.",
          "javax.",
          "jakarta.",
          "jdk.",
          "sun.",
          "com.sun.",
          "kotlin.",
          "kotlinx.",
          "scala.",
          "groovy.",
          "org.springframework.",
          "io.micronaut.",
          "io.quarkus.",
          "io.helidon.",
          "io.smallrye.",
          "io.vertx.",
          "org.jboss.",
          "org.glassfish.",
          "org.eclipse.",
          "org.hibernate.",
          "org.apache.",
          "org.slf4j.",
          "ch.qos.",
          "com.fasterxml.",
          "org.yaml.",
          "reactor.",
          "io.netty.",
          "lombok.",
          "com.google.",
          "net.bytebuddy.",
          "org.aspectj.",
          "org.objenesis.",
          "com.zaxxer.",
          "org.postgresql.",
          "com.mysql.",
          "org.h2.",
          "org.jooq.",
          "io.r2dbc.",
          "org.mongodb.",
          "com.mongodb.");

  /**
   * The framework's own packages. Their classes are only reachable from the wire when they are
   * shipped view models (the declarative orchestrators) — never the kernel's services.
   */
  /** Framework classes that ARE view models the framework itself instantiates from the wire. */
  private static final List<String> FRAMEWORK_VIEW_MODEL_PREFIXES =
      List.of(
          "io.mateu.core.infra.declarative.", "io.mateu.core.application.runaction.SeededYamlPage");

  /**
   * Stereotypes that mark a container-managed service, not a view model (simple names, so the core
   * stays framework-agnostic). Such a class is only accepted when it also carries the shape of a
   * view model (an AutoCrud singleton, say) or is registered.
   */
  private static final Set<String> SERVICE_STEREOTYPES =
      Set.of(
          "Service",
          "Repository",
          "Controller",
          "RestController",
          "ControllerAdvice",
          "RestControllerAdvice",
          "Configuration",
          "AutoConfiguration",
          "Mapper",
          "Factory");

  /** Injection points: a field filled by the container is a dependency, not part of the view. */
  static final Set<String> INJECTION_ANNOTATIONS =
      Set.of(
          "Autowired",
          "Inject",
          "Resource",
          "Value",
          "PersistenceContext",
          "PersistenceUnit",
          "Context",
          "ConfigProperty",
          "Property",
          "Client",
          "RestClient",
          "GrpcClient");

  /**
   * The uidl interfaces a VIEW MODEL implements (as opposed to the SPI a service implements — a
   * {@code CrudStore}, a {@code SecretsProvider}, an exporter…). Implementing one of these is part
   * of being shaped like a view model.
   */
  private static final List<String> VIEW_MODEL_INTERFACES =
      List.of(
          "App",
          "Page",
          "Listing",
          "ReactiveListing",
          "RouteHandler",
          "ReactiveRouteHandler",
          "ActionHandler",
          "ComponentTreeSupplier",
          "Content",
          "HeaderSupplier",
          "FooterSupplier",
          "ButtonsSupplier",
          "ToolbarSupplier",
          "TitleSupplier",
          "SubtitleSupplier",
          "PageTitleSupplier",
          "TitlePlaceholderSupplier",
          "OverlineSupplier",
          "MenuSupplier",
          "HomeRouteSupplier",
          "AppActionsSupplier",
          "Hydratable",
          "PostHydrationHandler",
          "StateSupplier",
          "RuleSupplier",
          "ValidationSupplier",
          "VisibilitySupplier",
          "DisabledSupplier",
          "ReadOnlySupplier",
          "RequiredSupplier",
          "BannerSupplier",
          "BreadcrumbsSupplier",
          "AvatarSupplier",
          "BadgeSupplier",
          "WidgetSupplier",
          "PageWidthSupplier",
          "PeerNavigationSupplier",
          "GroupActions",
          "GroupActionVisibility",
          "CommandSupplier",
          "ModelSupplier",
          "DescriptionSupplier",
          "LabelSupplier",
          "StyleSupplier",
          "ColspanSupplier",
          "Navigable",
          "Searchable",
          "SearchableSelection",
          "Filterable",
          "UploadEnabled",
          "Auditable",
          "Creatable",
          "Editable",
          "Deletable",
          "Identifiable",
          "Entity",
          "Named");

  private static final Set<Class<?>> VIEW_MODEL_INTERFACE_TYPES = loadViewModelInterfaces();

  private static Set<Class<?>> loadViewModelInterfaces() {
    var out = new HashSet<Class<?>>();
    for (var simpleName : VIEW_MODEL_INTERFACES) {
      try {
        out.add(
            Class.forName(
                "io.mateu.uidl.interfaces." + simpleName, false, WireTypes.class.getClassLoader()));
      } catch (ClassNotFoundException ignored) {
        // an interface renamed or removed: nothing to match
      }
    }
    return Set.copyOf(out);
  }

  // ── emitted by this process ───────────────────────────────────────────────

  private static final Set<String> EMITTED = ConcurrentHashMap.newKeySet();

  /**
   * Records a server-side type name this process has put on the wire itself (the type of a view an
   * action returned, a wizard row type…), so the client can name it back.
   */
  public static void emitted(String className) {
    if (className != null && !className.isBlank() && EMITTED.size() < 50_000) {
      EMITTED.add(className);
    }
  }

  public static boolean wasEmitted(String className) {
    return className != null && EMITTED.contains(className);
  }

  /**
   * A row type the client sent back in the state (a wizard step's {@code <field>_rowClass}, an
   * import's target row): accepted only when this process emitted it or it is reachable from the
   * view that owns it; otherwise a {@link MateuForbiddenException}.
   */
  public static Class<?> rowClass(String name, Class<?> owner) {
    if (name == null || !isBinaryName(name) || isDeniedPackage(name)) {
      throw refusedRow(name, owner);
    }
    if (!wasEmitted(name) && (owner == null || !closure(List.of(owner)).contains(name))) {
      throw refusedRow(name, owner);
    }
    return io.mateu.core.infra.reflection.ClassLoaders.forName(name);
  }

  private static MateuForbiddenException refusedRow(String name, Class<?> owner) {
    org.slf4j.LoggerFactory.getLogger(WireTypes.class)
        .warn(
            "Refused request: row class '{}' is not reachable from {}",
            name == null ? "null" : name.length() > 200 ? name.substring(0, 200) + "…" : name,
            owner == null ? "?" : owner.getName());
    return new MateuForbiddenException("row class not allowed");
  }

  // ── names and packages ────────────────────────────────────────────────────

  public static boolean isBinaryName(String name) {
    return name != null && name.length() <= 1024 && BINARY_NAME.matcher(name).matches();
  }

  /** A library/platform class, never a view model. */
  public static boolean isDeniedPackage(String name) {
    for (var prefix : DENIED_PREFIXES) {
      if (name.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }

  /** Where the framework's own artifacts (core, uidl, dtos) were loaded from. */
  private static final Set<String> FRAMEWORK_CODE_SOURCES =
      new HashSet<>(
          List.of(
              codeSourceOf(WireTypes.class),
              codeSourceOf(io.mateu.uidl.annotations.UI.class),
              codeSourceOf(io.mateu.dtos.UIIncrementDto.class)));

  /** The framework's own packages (core, uidl, dtos). */
  private static final List<String> FRAMEWORK_PREFIXES =
      List.of("io.mateu.core.", "io.mateu.uidl.", "io.mateu.dtos.");

  private static String codeSourceOf(Class<?> c) {
    try {
      var domain = c.getProtectionDomain();
      var source = domain != null ? domain.getCodeSource() : null;
      var location = source != null ? source.getLocation() : null;
      return location != null ? location.toString() : "";
    } catch (RuntimeException e) {
      return "";
    }
  }

  /**
   * A class shipped in the framework's own artifacts (core, uidl, dtos) — told apart by WHERE it
   * was loaded from, not only by its package, so an application (or a test) whose classes share the
   * {@code io.mateu} namespace is not mistaken for the framework.
   */
  public static boolean isFramework(Class<?> c) {
    if (c == null) {
      return false;
    }
    var name = c.getName();
    if (FRAMEWORK_PREFIXES.stream().noneMatch(name::startsWith)) {
      return false;
    }
    var source = codeSourceOf(c);
    return source.isEmpty() || FRAMEWORK_CODE_SOURCES.contains(source);
  }

  /** A framework class that is not one of the view models the framework ships. */
  public static boolean isFrameworkInternal(Class<?> c) {
    if (!isFramework(c)) {
      return false;
    }
    var name = c.getName();
    for (var prefix : FRAMEWORK_VIEW_MODEL_PREFIXES) {
      if (name.startsWith(prefix)) {
        return false;
      }
    }
    return true;
  }

  /** Loads a class WITHOUT initializing it; null when it is not on the classpath. */
  public static Class<?> loadWithoutInit(String name) {
    var context = Thread.currentThread().getContextClassLoader();
    if (context != null) {
      try {
        return Class.forName(name, false, context);
      } catch (ClassNotFoundException | LinkageError ignored) {
        // fall back to the framework's own loader
      }
    }
    try {
      return Class.forName(name, false, WireTypes.class.getClassLoader());
    } catch (ClassNotFoundException | LinkageError e) {
      return null;
    }
  }

  // ── shape ─────────────────────────────────────────────────────────────────

  /** A class the reflective factory can actually build: not an interface, abstract, enum, … */
  public static boolean isConcrete(Class<?> type) {
    return type != null
        && !type.isInterface()
        && !type.isAnnotation()
        && !type.isEnum()
        && !type.isArray()
        && !type.isPrimitive()
        && !Modifier.isAbstract(type.getModifiers());
  }

  /** Annotated with a service stereotype ({@code @Service}, {@code @Repository}, …). */
  public static boolean isServiceStereotyped(Class<?> type) {
    for (var annotation : type.getAnnotations()) {
      if (SERVICE_STEREOTYPES.contains(annotation.annotationType().getSimpleName())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Shaped like a Mateu view model: a concrete application class (or one of the framework's own
   * declarative orchestrators) that declares itself to Mateu — a uidl annotation on the class, a
   * field or a method; a view-model uidl interface; or a framework view-model base class.
   */
  public static boolean isViewModelShaped(Class<?> type) {
    if (!isConcrete(type)) {
      return false;
    }
    var name = type.getName();
    if (isDeniedPackage(name) || isFrameworkInternal(type)) {
      return false;
    }
    for (var iface : VIEW_MODEL_INTERFACE_TYPES) {
      if (iface.isAssignableFrom(type)) {
        return true;
      }
    }
    for (Class<?> c = type;
        c != null && c != Object.class && c != Record.class;
        c = c.getSuperclass()) {
      var cn = c.getName();
      if (c != type && isFramework(c)) {
        if (cn.startsWith("io.mateu.core.infra.declarative.")) {
          return true; // extends one of the framework's view-model base classes (AutoCrud, …)
        }
        break;
      }
      if (isDeniedPackage(cn)) {
        break;
      }
      if (hasUidlAnnotation(c)) {
        return true;
      }
      try {
        for (Field f : c.getDeclaredFields()) {
          if (hasUidlAnnotation(f)) {
            return true;
          }
        }
        for (Method m : c.getDeclaredMethods()) {
          if (hasUidlAnnotation(m)) {
            return true;
          }
        }
      } catch (LinkageError e) {
        return false;
      }
    }
    return false;
  }

  /** Carries an {@code io.mateu.uidl.annotations} annotation, directly or one level composed. */
  public static boolean hasUidlAnnotation(AnnotatedElement element) {
    Annotation[] annotations;
    try {
      annotations = element.getAnnotations();
    } catch (LinkageError | RuntimeException e) {
      return false;
    }
    for (var annotation : annotations) {
      var type = annotation.annotationType();
      if (isUidlAnnotation(type)) {
        return true;
      }
      if (type.getName().startsWith("java.")) {
        continue;
      }
      for (var meta : type.getAnnotations()) {
        if (isUidlAnnotation(meta.annotationType())) {
          return true;
        }
      }
    }
    return false;
  }

  private static boolean isUidlAnnotation(Class<? extends Annotation> type) {
    return type.getName().startsWith("io.mateu.uidl.annotations.");
  }

  /** Filled by the container ({@code @Autowired}, {@code @Inject}, …). */
  public static boolean isInjected(AnnotatedElement element) {
    for (var annotation : element.getAnnotations()) {
      if (INJECTION_ANNOTATIONS.contains(annotation.annotationType().getSimpleName())) {
        return true;
      }
    }
    return false;
  }

  // ── reachability ──────────────────────────────────────────────────────────

  private static final int MAX_CLOSURE = 20_000;

  /**
   * The classes reachable from {@code roots} through what a view can legitimately put on screen:
   * the types of its (non-static, non-injected) fields and their generic arguments, the return
   * types of its uidl-annotated methods, the generic arguments of its supertypes (a crud's row
   * type) and its member classes. Library and framework-internal types are neither included nor
   * walked into; interfaces and abstract classes are walked (for their generic arguments) but are
   * never members — the reflective factory cannot build them, and a container would answer one with
   * an arbitrary bean.
   */
  public static Set<String> closure(Collection<Class<?>> roots) {
    var members = new LinkedHashSet<String>();
    var visited = new HashSet<Class<?>>();
    var queue = new ArrayDeque<Class<?>>();
    for (var root : roots) {
      if (root != null) {
        queue.add(root);
      }
    }
    while (!queue.isEmpty() && visited.size() < MAX_CLOSURE) {
      var c = queue.poll();
      if (c == null || !visited.add(c)) {
        continue;
      }
      if (c.isArray()) {
        queue.add(c.getComponentType());
        continue;
      }
      if (c.isPrimitive() || c.isAnnotation()) {
        continue;
      }
      var name = c.getName();
      if (isDeniedPackage(name)) {
        continue;
      }
      var framework = isFrameworkInternal(c);
      if (!framework && isConcrete(c) && (!isServiceStereotyped(c) || isViewModelShaped(c))) {
        members.add(name);
      }
      try {
        // generic arguments of the supertypes: AutoCrud<Row>, Listing<Filters, Row>, …
        addTypeArguments(c.getGenericSuperclass(), queue);
        for (var iface : c.getGenericInterfaces()) {
          addTypeArguments(iface, queue);
        }
        if (framework) {
          continue; // never walk into the kernel's own fields
        }
        for (Class<?> k = c;
            k != null && k != Object.class && k != Record.class;
            k = k.getSuperclass()) {
          var kn = k.getName();
          if (isDeniedPackage(kn) || isFramework(k)) {
            break;
          }
          for (Field f : k.getDeclaredFields()) {
            if (Modifier.isStatic(f.getModifiers()) || f.isSynthetic() || isInjected(f)) {
              continue;
            }
            addType(f.getGenericType(), queue);
          }
          for (Method m : k.getDeclaredMethods()) {
            if (Modifier.isPrivate(m.getModifiers()) || m.isSynthetic() || !hasUidlAnnotation(m)) {
              continue;
            }
            addType(m.getGenericReturnType(), queue);
          }
          for (var member : k.getDeclaredClasses()) {
            queue.add(member);
          }
        }
      } catch (LinkageError | RuntimeException e) {
        // an optional dependency missing for some member: keep what we have
      }
    }
    return members;
  }

  private static void addTypeArguments(Type type, ArrayDeque<Class<?>> queue) {
    if (type instanceof ParameterizedType parameterized) {
      for (var argument : parameterized.getActualTypeArguments()) {
        addType(argument, queue);
      }
    }
  }

  private static void addType(Type type, ArrayDeque<Class<?>> queue) {
    if (type instanceof Class<?> c) {
      queue.add(c);
    } else if (type instanceof ParameterizedType parameterized) {
      if (parameterized.getRawType() instanceof Class<?> raw) {
        queue.add(raw);
      }
      for (var argument : parameterized.getActualTypeArguments()) {
        addType(argument, queue);
      }
    } else if (type instanceof GenericArrayType array) {
      addType(array.getGenericComponentType(), queue);
    } else if (type instanceof WildcardType wildcard) {
      for (var bound : wildcard.getUpperBounds()) {
        addType(bound, queue);
      }
    } else if (type instanceof TypeVariable<?> variable) {
      for (var bound : variable.getBounds()) {
        if (bound != Object.class) {
          addType(bound, queue);
        }
      }
    }
  }
}
