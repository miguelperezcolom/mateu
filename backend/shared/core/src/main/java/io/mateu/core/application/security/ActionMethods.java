package io.mateu.core.application.security;

import io.mateu.core.domain.Authorizer;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.AllMethodsProvider;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;

/**
 * Which members an {@code actionId} from the wire may run, and whether the caller may run them.
 *
 * <p>A method is an action when it is <b>marked</b> as one — {@code @Action}, {@code @Button},
 * {@code @Toolbar}, {@code @ListToolbarButton}, {@code @ViewToolbarButton}, {@code @Fab}, {@code
 * GroupAction}, {@code @WizardCompletionAction}, {@code @RestAction} (directly or through a
 * composed annotation) and not private — or, following the documented convention ("actions are
 * public methods"), when it is a <b>public</b> instance method of the view model itself that is not
 * plumbing: not declared by {@code Object}, a library or the framework; not an accessor (a getter,
 * a setter, a record component); not the implementation of a framework callback interface; not a
 * container lifecycle or injection method. A private method is never an action, and a non-public
 * one is only reachable when it carries a marker — the marker is the developer's explicit
 * declaration.
 *
 * <p>Access annotations are enforced on invocation, not only when rendering: an {@code @EyesOnly}
 * or {@code @DisabledUnless} on the member, or an {@code @EyesOnly} on its class, that the caller's
 * token does not satisfy refuses the call with a {@link MateuForbiddenException}.
 */
@Slf4j
public final class ActionMethods {

  private ActionMethods() {}

  private static final List<Class<? extends Annotation>> MARKERS =
      List.of(
          io.mateu.uidl.annotations.Action.class,
          io.mateu.uidl.annotations.Button.class,
          io.mateu.uidl.annotations.Toolbar.class,
          io.mateu.uidl.annotations.ListToolbarButton.class,
          io.mateu.uidl.annotations.ViewToolbarButton.class,
          io.mateu.uidl.annotations.Fab.class,
          io.mateu.uidl.annotations.GroupAction.class,
          io.mateu.uidl.annotations.WizardCompletionAction.class,
          io.mateu.uidl.annotations.RestAction.class,
          io.mateu.uidl.annotations.Menu.class);

  /** Container lifecycle / wiring methods: never actions, whatever their visibility. */
  private static final Set<String> LIFECYCLE_ANNOTATIONS =
      Set.of(
          "PostConstruct",
          "PreDestroy",
          "Autowired",
          "Inject",
          "Bean",
          "EventListener",
          "Scheduled",
          "PostLoad",
          "PrePersist",
          "PostPersist",
          "PreUpdate",
          "PostUpdate",
          "PreRemove",
          "PostRemove");

  /**
   * The setting for strict action mode — ON by default since 3.0-alpha.426. Strict: a method is an
   * action when it carries an action marker, is declared by a {@code ComponentAdapter}, or its id
   * is ADVERTISED by the view (named by its triggers, subscriptions, {@code @OnRowSelected}, its
   * action list or the components it holds or supplies — see {@code AdvertisedActions}); an
   * incidental public method nobody advertised is not reachable from the wire. {@code
   * mateu.actions.strict=false} opts back into the convention ("every public method of the view
   * model is an action"); see the threat model in the security guide.
   */
  public static final String STRICT = "mateu.actions.strict";

  /**
   * Whether strict action mode is on: unless {@value #STRICT} (or {@code MATEU_ACTIONS_STRICT}) is
   * set to something other than {@code true}.
   */
  public static boolean isStrict() {
    var configured = io.mateu.core.infra.MateuSettings.get(STRICT);
    return configured == null || Boolean.parseBoolean(configured);
  }

  /** Carries one of the action markers, directly or composed. */
  public static boolean isMarked(AnnotatedElement element) {
    for (var marker : MARKERS) {
      if (MetaAnnotations.isPresent(element, marker)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Whether {@code method}, found on an instance of {@code instanceClass}, may be invoked by an
   * actionId that came from the wire.
   */
  public static boolean isInvocable(Method method, Class<?> instanceClass) {
    if (method == null) {
      return false;
    }
    int modifiers = method.getModifiers();
    if (Modifier.isPrivate(modifiers) || method.isSynthetic() || method.isBridge()) {
      return false;
    }
    var declaring = method.getDeclaringClass();
    if (declaring == Object.class || declaring == Record.class || declaring == Enum.class) {
      return false;
    }
    if (hasSimpleNamedAnnotation(method, LIFECYCLE_ANNOTATIONS)) {
      return false;
    }
    var declaringName = declaring.getName();
    if (WireTypes.isDeniedPackage(declaringName)) {
      return false;
    }
    if (isMarked(method)) {
      return true;
    }
    if (isStrict()) {
      // strict mode: an action is what the developer DECLARED as one, nothing inferred — an
      // incidental public method (a helper, a service-like method on the view model) is not
      // reachable from the wire just because it is public. One the view ADVERTISES is accepted by
      // resolve(), which has the instance to ask.
      return false;
    }
    return isConventional(method, instanceClass);
  }

  /**
   * Whether {@code method} may run on {@code instance} for this request: an action by itself
   * ({@link #isInvocable(Method, Class)}), or — strict mode — a method the conventions recognise
   * whose name the view advertises (a {@code ColumnAction("approve")} written in its code, a
   * component naming it…). The row and view-action runners ask this.
   */
  public static boolean isInvocable(Method method, Object instance, HttpRequest httpRequest) {
    if (instance == null) {
      return isInvocable(method, (Class<?>) null);
    }
    var type = instance.getClass();
    return isInvocable(method, type)
        || (isStrict()
            && isEligible(method)
            && isConventional(method, type)
            && io.mateu.core.domain.out.fragmentmapper.mappers.AdvertisedActions.advertises(
                instance, httpRequest, method.getName()));
  }

  /**
   * Whether {@code method} may HANDLE an action id the view advertises: an action by marker, or a
   * method the conventions recognise (a public, non-plumbing method of the view model, or a row
   * method). Whatever the strict setting — this is what a component referencing an id is matched
   * against before the id is advertised; strict mode then accepts the call because it was.
   */
  public static boolean isHandler(Method method, Class<?> instanceClass) {
    return isEligible(method) && (isMarked(method) || isConventional(method, instanceClass));
  }

  /** The structural refusals of {@link #isInvocable}, before markers and conventions. */
  private static boolean isEligible(Method method) {
    if (method == null) {
      return false;
    }
    int modifiers = method.getModifiers();
    if (Modifier.isPrivate(modifiers) || method.isSynthetic() || method.isBridge()) {
      return false;
    }
    var declaring = method.getDeclaringClass();
    if (declaring == Object.class || declaring == Record.class || declaring == Enum.class) {
      return false;
    }
    return !hasSimpleNamedAnnotation(method, LIFECYCLE_ANNOTATIONS)
        && !WireTypes.isDeniedPackage(declaring.getName());
  }

  private static boolean isConventional(Method method, Class<?> instanceClass) {
    int modifiers = method.getModifiers();
    var declaring = method.getDeclaringClass();
    // ── the conventions: methods of the view model itself that are not plumbing ──
    if (Modifier.isStatic(modifiers)) {
      return false;
    }
    if (WireTypes.isFramework(declaring)) {
      return false; // the framework's own methods are only reachable through their runners
    }
    if (isAccessor(method)) {
      return false;
    }
    if (implementsLibraryOrFrameworkContract(method, instanceClass)) {
      return false;
    }
    // "actions are public methods"
    if (Modifier.isPublic(modifiers)) {
      return true;
    }
    // a row action ({@code ColumnAction("retry")} → {@code action-on-row-retry}): the method
    // receives the clicked row or the selected rows, which is how its row is bound
    return bindsRows(method);
  }

  /**
   * Takes the clicked row (a parameter of an application type) or the selected rows (a {@code
   * List}) — the parameters {@code RunMethodActionRunner.createParameters} binds from the request.
   */
  static boolean bindsRows(Method method) {
    for (var parameter : method.getParameterTypes()) {
      if (List.class.isAssignableFrom(parameter)) {
        return true;
      }
      if (!HttpRequest.class.isAssignableFrom(parameter)
          && !parameter.isPrimitive()
          && !parameter.isArray()
          && !WireTypes.isDeniedPackage(parameter.getName())) {
        return true;
      }
    }
    return false;
  }

  /**
   * The method an actionId names on {@code instanceClass}, when it is invocable; null when no
   * method has that name. Throws when a method with that name exists but is not an action.
   */
  public static Method findInvocable(Class<?> instanceClass, String name) {
    var method = invocableNamed(instanceClass, name);
    if (method == null && namesAMethod(instanceClass, name)) {
      throw notAnAction(instanceClass, name);
    }
    return method;
  }

  /** The invocable method named {@code name}, or null (whether or not a non-action one exists). */
  private static Method invocableNamed(Class<?> instanceClass, String name) {
    for (var m : AllMethodsProvider.getAllMethods(instanceClass)) {
      if (m.getName().equals(name) && isInvocable(m, instanceClass)) {
        return m;
      }
    }
    // interface default methods and inherited public methods getAllMethods does not list
    for (var m : instanceClass.getMethods()) {
      if (m.getName().equals(name) && isInvocable(m, instanceClass)) {
        return m;
      }
    }
    return null;
  }

  /** The method named {@code name} the conventions would accept, or null. */
  private static Method handlerNamed(Class<?> instanceClass, String name) {
    for (var m : AllMethodsProvider.getAllMethods(instanceClass)) {
      if (m.getName().equals(name) && isEligible(m) && isConventional(m, instanceClass)) {
        return m;
      }
    }
    for (var m : instanceClass.getMethods()) {
      if (m.getName().equals(name) && isEligible(m) && isConventional(m, instanceClass)) {
        return m;
      }
    }
    return null;
  }

  /** Whether any method (action or not) is called {@code name}. */
  private static boolean namesAMethod(Class<?> instanceClass, String name) {
    return AllMethodsProvider.getAllMethods(instanceClass).stream()
            .anyMatch(m -> m.getName().equals(name))
        || hasPublicMethodNamed(instanceClass, name);
  }

  private static boolean hasPublicMethodNamed(Class<?> c, String name) {
    for (var m : c.getMethods()) {
      if (m.getName().equals(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Whether {@code field} may be read/run by an actionId: a non-static, non-injected field that is
   * marked as an action or menu entry, or that holds a function ({@code Runnable}, {@code
   * Callable}, {@code Supplier}, {@code Function}, {@code Consumer}) — the field form of a button.
   */
  public static boolean isInvocable(Field field) {
    if (field == null) {
      return false;
    }
    int modifiers = field.getModifiers();
    if (Modifier.isStatic(modifiers) || field.isSynthetic() || WireTypes.isInjected(field)) {
      return false;
    }
    if (WireTypes.isDeniedPackage(field.getDeclaringClass().getName())) {
      return false;
    }
    if (isMarked(field)) {
      return true;
    }
    if (Modifier.isPrivate(modifiers)) {
      return false;
    }
    var type = field.getType();
    return Runnable.class.isAssignableFrom(type)
        || Callable.class.isAssignableFrom(type)
        || Supplier.class.isAssignableFrom(type)
        || Function.class.isAssignableFrom(type)
        || Consumer.class.isAssignableFrom(type);
  }

  /**
   * Refuses the call when the caller's token does not satisfy an {@code @EyesOnly} or {@code
   * DisabledUnless} on the member, or an {@code @EyesOnly} on the instance's class.
   */
  public static void checkAccess(Member member, Class<?> instanceClass, HttpRequest httpRequest) {
    var element = (AnnotatedElement) member;
    var eyesOnly = MetaAnnotations.find(element, EyesOnly.class);
    if (eyesOnly != null && !Authorizer.isAuthorized(eyesOnly, httpRequest)) {
      throw refused(instanceClass, member.getName(), "@EyesOnly not satisfied");
    }
    var disabledUnless = MetaAnnotations.find(element, DisabledUnless.class);
    if (disabledUnless != null && !Authorizer.isAuthorized(disabledUnless, httpRequest)) {
      throw refused(instanceClass, member.getName(), "@DisabledUnless not satisfied");
    }
    if (instanceClass != null
        && !WireTypePolicy.classLevelAccessGranted(instanceClass, httpRequest)) {
      throw refused(instanceClass, member.getName(), "class-level @EyesOnly not satisfied");
    }
  }

  /** {@link #findInvocable} + {@link #checkAccess}: the method to run, or null if none is named. */
  public static Method resolve(Object instance, String name, HttpRequest httpRequest) {
    return resolve(
        instance,
        name,
        httpRequest,
        () ->
            io.mateu.core.domain.out.fragmentmapper.mappers.AdvertisedActions.advertises(
                instance, httpRequest, name));
  }

  /**
   * As {@link #resolve(Object, String, HttpRequest)}, with the caller saying whether the id was
   * advertised (a nested form's action is advertised by the view holding it, under a prefixed id).
   */
  public static Method resolve(
      Object instance,
      String name,
      HttpRequest httpRequest,
      java.util.function.BooleanSupplier advertised) {
    // The cheap, reflective answer first: asking a ComponentAdapter means running its adapt() —
    // building the whole view — so it is consulted only when the method is NOT an action by itself
    // (a non-public or, in strict mode, unmarked method the adapter declares).
    var method = invocableNamed(instance.getClass(), name);
    if (method == null && isStrict()) {
      // strict: an unmarked method answers only to an id its view ADVERTISED (named it in a
      // trigger, a component, a menu rule…) — computed only on this path
      var handler = handlerNamed(instance.getClass(), name);
      if (handler != null && advertised.getAsBoolean()) {
        method = handler;
      }
    }
    if (method == null) {
      method = declaredByAdapter(instance, name, httpRequest);
    }
    if (method == null && namesAMethod(instance.getClass(), name)) {
      throw notAnAction(instance.getClass(), name);
    }
    if (method != null) {
      checkAccess(method, instance.getClass(), httpRequest);
    }
    return method;
  }

  /**
   * A domain object rendered through a {@code ComponentAdapter} declares its actions in the {@code
   * AdaptedView} the adapter returns: those ids are actions by declaration, whatever the method's
   * (non-private) visibility. Null when there is no adapter or it does not declare {@code name}.
   */
  @SuppressWarnings({"unchecked", "rawtypes"})
  private static Method declaredByAdapter(Object instance, String name, HttpRequest httpRequest) {
    io.mateu.uidl.interfaces.ComponentAdapter adapter;
    try {
      adapter = io.mateu.core.infra.adapters.AdapterRegistry.find(instance.getClass());
    } catch (RuntimeException e) {
      return null;
    }
    if (adapter == null) {
      return null;
    }
    var view = adapter.adapt(instance, httpRequest);
    if (view == null || view.actions() == null || !view.actions().contains(name)) {
      return null;
    }
    for (var m : AllMethodsProvider.getAllMethods(instance.getClass())) {
      int modifiers = m.getModifiers();
      if (m.getName().equals(name)
          && !Modifier.isPrivate(modifiers)
          && !Modifier.isStatic(modifiers)
          && !m.isSynthetic()
          && !hasSimpleNamedAnnotation(m, LIFECYCLE_ANNOTATIONS)
          && !WireTypes.isDeniedPackage(m.getDeclaringClass().getName())) {
        return m;
      }
    }
    return null;
  }

  /**
   * The refusal of an action id no handler of the view claims: logged at WARN (the id is wire input
   * anyone can vary, so never an ERROR with a stack trace) and answered 403.
   */
  public static MateuForbiddenException noSuchAction(Class<?> instanceClass, String name) {
    return refused(instanceClass, name, "no such action");
  }

  /**
   * The refusal of a method that exists but is not an action — logged at WARN with the strict-mode
   * hint, since since 3.0-alpha.426 that is the usual reason a button that used to work stops.
   */
  public static MateuForbiddenException notAnAction(Class<?> instanceClass, String name) {
    return refused(
        instanceClass,
        name,
        isStrict()
            ? "not an action: mark it @Action (strict action mode, mateu.actions.strict)"
            : "not an action");
  }

  static MateuForbiddenException refused(Class<?> instanceClass, String name, String reason) {
    var type = instanceClass != null ? instanceClass.getName() : "?";
    log.warn("Refused action '{}' on {}: {}", abbreviate(name), type, reason);
    return new MateuForbiddenException(
        "action not allowed: " + abbreviate(name) + " (" + reason + ")");
  }

  private static String abbreviate(String s) {
    if (s == null) {
      return "null";
    }
    return s.length() > 120 ? s.substring(0, 120) + "…" : s;
  }

  // ── plumbing detection ────────────────────────────────────────────────────

  /** A getter / setter / record accessor: state access, not an action. */
  static boolean isAccessor(Method method) {
    var name = method.getName();
    int params = method.getParameterCount();
    var declaring = method.getDeclaringClass();
    if (declaring.isRecord() && params == 0) {
      for (var component : declaring.getRecordComponents()) {
        if (component.getName().equals(name)) {
          return true;
        }
      }
    }
    if (params == 0 && method.getReturnType() != void.class) {
      if (isPropertyPrefixed(name, "get") || isPropertyPrefixed(name, "is")) {
        return true;
      }
    }
    if (params == 1 && isPropertyPrefixed(name, "set")) {
      return true;
    }
    return false;
  }

  private static boolean isPropertyPrefixed(String name, String prefix) {
    return name.length() > prefix.length()
        && name.startsWith(prefix)
        && Character.isUpperCase(name.charAt(prefix.length()));
  }

  /**
   * Whether {@code method} implements/overrides a method declared by a library or by the framework
   * (a {@code Listing.search}, an {@code ActionHandler.handleAction}, a {@code Runnable.run}, a
   * {@code Comparable.compareTo}…): those are callbacks the framework or the platform invokes, and
   * the framework has its own runners for the ones that are actions.
   */
  private static boolean implementsLibraryOrFrameworkContract(
      Method method, Class<?> instanceClass) {
    var name = method.getName();
    var params = method.getParameterTypes();
    try {
      Object.class.getDeclaredMethod(name, params);
      return true; // toString, equals, hashCode, clone, finalize overridden by the view
    } catch (NoSuchMethodException ignored) {
      // not an Object method
    }
    for (Class<?> c = instanceClass; c != null; c = c.getSuperclass()) {
      if (declaresContract(c, name, params)) {
        return true;
      }
    }
    return false;
  }

  private static boolean declaresContract(Class<?> c, String name, Class<?>[] params) {
    for (var iface : c.getInterfaces()) {
      var ifaceName = iface.getName();
      if (WireTypes.isDeniedPackage(ifaceName) || WireTypes.isFramework(iface)) {
        try {
          iface.getMethod(name, params);
          return true;
        } catch (NoSuchMethodException ignored) {
          // not declared there
        }
      }
      if (declaresContract(iface, name, params)) {
        return true;
      }
    }
    var superclass = c.getSuperclass();
    if (superclass != null) {
      var superName = superclass.getName();
      if (superclass != Object.class
          && (WireTypes.isDeniedPackage(superName) || WireTypes.isFramework(superclass))) {
        try {
          superclass.getMethod(name, params);
          return true;
        } catch (NoSuchMethodException ignored) {
          // not declared there
        }
      }
    }
    return false;
  }

  private static boolean hasSimpleNamedAnnotation(AnnotatedElement element, Set<String> names) {
    for (var annotation : element.getAnnotations()) {
      if (names.contains(annotation.annotationType().getSimpleName())) {
        return true;
      }
    }
    return false;
  }
}
