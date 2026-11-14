package io.mateu.core.domain;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.core.infra.reflection.read.AllFieldsProvider;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * THE one place that decides what a caller may READ and WRITE of a field — {@code @EyesOnly},
 * {@code @ReadOnlyUnless}, {@code @DisabledUnless} (and, for what is drawn, {@code @Audience}) —
 * and the walks that apply it to state-shaped maps, top level and NESTED alike.
 *
 * <p>Every path uses it: the form (FormFieldFilter), the listing columns and rows, the state sent
 * to the client (ComponentState, State/Data fragments), the state taken from the client (the
 * instance factory, before a setter, a constructor or a builder sees it) and the CRUD saves
 * (ClientWritableFields). Before it, each path asked its own question, and three of them forgot
 * one: listing rows ignored {@code @EyesOnly}, nested forms were not checked one level down, and
 * records skipped the setter-only check (GA review S2, S3, java-core #3).
 *
 * <p>The shape of a class (which fields are guarded, which hold nested application objects) is read
 * once per class; per request only the guarded fields are authorized.
 */
public final class FieldAccess {

  private FieldAccess() {}

  // ── the predicates ─────────────────────────────────────────────────────────────────────────

  /** Whether the caller may READ the field's value ({@code @EyesOnly}). */
  public static boolean mayRead(Field field, HttpRequest httpRequest) {
    var eyesOnly = MetaAnnotations.find(field, EyesOnly.class);
    return eyesOnly == null || Authorizer.isAuthorized(eyesOnly, httpRequest);
  }

  /**
   * Whether the field is DRAWN for the caller: they may read it and it belongs to the current
   * audience's projection ({@code @Audience}, a UX aid, not security).
   */
  public static boolean isShown(Field field, HttpRequest httpRequest) {
    return mayRead(field, httpRequest)
        && AudienceGate.visible(MetaAnnotations.find(field, Audience.class), httpRequest);
  }

  /**
   * Whether the CLIENT may write the field: it is view state (not static, not a dependency the
   * container injected), the caller may read it and neither {@code @ReadOnlyUnless} nor {@code
   * DisabledUnless} locks it for them.
   */
  public static boolean mayWrite(Field field, HttpRequest httpRequest) {
    if (Modifier.isStatic(field.getModifiers())
        || io.mateu.core.application.security.WireTypes.isInjected(field)) {
      return false;
    }
    if (!mayRead(field, httpRequest)) {
      return false;
    }
    var readOnlyUnless = MetaAnnotations.find(field, ReadOnlyUnless.class);
    if (readOnlyUnless != null && !Authorizer.isAuthorized(readOnlyUnless, httpRequest)) {
      return false;
    }
    var disabledUnless = MetaAnnotations.find(field, DisabledUnless.class);
    return disabledUnless == null || Authorizer.isAuthorized(disabledUnless, httpRequest);
  }

  // ── the server scope ───────────────────────────────────────────────────────────────────────

  private static final ThreadLocal<int[]> SERVER_SCOPE = ThreadLocal.withInitial(() -> new int[1]);

  /**
   * Runs {@code work} building instances from a map the SERVER assembled (a CRUD save lays the
   * client-writable fields over the stored record): there the protected fields carry the stored
   * values, and dropping them as if the client had sent them would erase them.
   */
  public static <T> T asServer(Supplier<T> work) {
    var depth = SERVER_SCOPE.get();
    depth[0]++;
    try {
      return work.get();
    } finally {
      depth[0]--;
    }
  }

  /** Whether the current thread is building from a server-assembled map ({@link #asServer}). */
  public static boolean inServerScope() {
    return SERVER_SCOPE.get()[0] > 0;
  }

  // ── the walks ──────────────────────────────────────────────────────────────────────────────

  /** One field of a shape: guarded by an access annotation, or holding application objects. */
  private record Slot(Field field, boolean guarded, Class<?> nested, boolean many, boolean keyed) {
    Slot(Field field, boolean guarded, Class<?> nested, boolean many) {
      this(field, guarded, nested, many, false);
    }
  }

  private record Shape(Map<String, Slot> slots, boolean guardedAnywhere) {
    static final Shape NONE = new Shape(Map.of(), false);
  }

  private static final ClassValue<Shape> SHAPES =
      new ClassValue<>() {
        @Override
        protected Shape computeValue(Class<?> type) {
          return shapeOf(type);
        }
      };

  private static Shape shapeOf(Class<?> type) {
    if (!isApplicationType(type)) {
      return Shape.NONE;
    }
    var slots = new LinkedHashMap<String, Slot>();
    var guardedAnywhere = false;
    for (var field : AllFieldsProvider.getAllFields(type)) {
      var guarded =
          Modifier.isStatic(field.getModifiers())
              || io.mateu.core.application.security.WireTypes.isInjected(field)
              || MetaAnnotations.isPresent(field, EyesOnly.class)
              || MetaAnnotations.isPresent(field, ReadOnlyUnless.class)
              || MetaAnnotations.isPresent(field, DisabledUnless.class);
      Class<?> nested = null;
      var many = false;
      var keyed = false;
      if (!Modifier.isStatic(field.getModifiers())) {
        if (Collection.class.isAssignableFrom(field.getType())) {
          var element = elementType(field);
          if (element != null && isApplicationType(element)) {
            nested = element;
            many = true;
          }
        } else if (field.getType().isArray()) {
          // an array of application objects travels as a list of maps (GA round 2, J5)
          var element = field.getType().getComponentType();
          if (isApplicationType(element)) {
            nested = element;
            many = true;
          }
        } else if (Map.class.isAssignableFrom(field.getType())) {
          // a map's VALUES are the application objects (Map<String, Pay>), each a nested map
          var value = typeArgument(field, 1, 2);
          if (value != null && isApplicationType(value)) {
            nested = value;
            keyed = true;
          }
        } else if (java.util.Optional.class.equals(field.getType())) {
          // an Optional<Pay> travels as Pay's own map (or nothing)
          var content = typeArgument(field, 0, 1);
          if (content != null && isApplicationType(content)) {
            nested = content;
          }
        } else if (isApplicationType(field.getType())) {
          nested = field.getType();
        }
      }
      if (guarded || nested != null) {
        slots.put(field.getName(), new Slot(field, guarded, nested, many, keyed));
        guardedAnywhere |= guarded || nested != null;
      }
    }
    return slots.isEmpty() ? Shape.NONE : new Shape(Map.copyOf(slots), guardedAnywhere);
  }

  /** The {@code index}-th of the field's {@code arity} type arguments, when it is a plain class. */
  private static Class<?> typeArgument(Field field, int index, int arity) {
    if (field.getGenericType() instanceof ParameterizedType parameterized
        && parameterized.getActualTypeArguments().length == arity
        && parameterized.getActualTypeArguments()[index] instanceof Class<?> argument) {
      return argument;
    }
    return null;
  }

  private static Class<?> elementType(Field field) {
    if (field.getGenericType() instanceof ParameterizedType parameterized
        && parameterized.getActualTypeArguments().length == 1
        && parameterized.getActualTypeArguments()[0] instanceof Class<?> element) {
      return element;
    }
    return null;
  }

  /** An object of the application's own (a form, a row, an entity), worth looking into. */
  public static boolean isApplicationType(Class<?> type) {
    if (type == null
        || type.isPrimitive()
        || type.isEnum()
        || type.isArray()
        || type.isInterface()
        || BasicTypeChecker.isBasic(type)
        || Map.class.isAssignableFrom(type)
        || Collection.class.isAssignableFrom(type)) {
      return false;
    }
    var name = type.getName();
    return !name.startsWith("java.")
        && !name.startsWith("javax.")
        && !name.startsWith("jakarta.")
        && !name.startsWith("com.fasterxml.")
        && !name.startsWith("io.mateu.uidl.")
        && !name.startsWith("io.mateu.dtos.")
        && !name.startsWith("reactor.");
  }

  private static final int MAX_DEPTH = 8;

  /**
   * {@code state} (a state-shaped map of a {@code type} instance) without the values the caller may
   * not READ, at any depth: nested objects and lists of them, and the flattened {@code a-b} keys of
   * an inline nested form. The same map when nothing is removed.
   */
  public static Map<String, Object> readable(
      Class<?> type, Map<String, Object> state, HttpRequest httpRequest) {
    return walk(type, null, state, httpRequest, false, 0);
  }

  /**
   * As {@link #readable(Class, Map, HttpRequest)} for the state of {@code source}, walked by the
   * RUNTIME class of each nested value: a {@code Derived} held in a {@code Base} field (or list, or
   * map) is filtered by {@code Derived}'s own rules — by the declared type alone its {@code
   * EyesOnly} fields travelled (GA round 2, J5).
   */
  public static Map<String, Object> readable(
      Object source, Map<String, Object> state, HttpRequest httpRequest) {
    if (source == null) {
      return state;
    }
    return walk(source.getClass(), source, state, httpRequest, false, 0);
  }

  /**
   * {@code state} as sent by the client, without the values it may not WRITE (see {@link
   * #mayWrite}), at any depth. The same map when nothing is removed.
   */
  public static Map<String, Object> writable(
      Class<?> type, Map<String, Object> state, HttpRequest httpRequest) {
    return walk(type, null, withoutDottedKeys(state), httpRequest, true, 0);
  }

  /**
   * {@code state} without its DOTTED keys ({@code pay.salary}). The client never sends one — a
   * nested form travels as a nested map or as flattened {@code pay-salary} keys — but the
   * reflective writer follows a dot through the parent's getter, so such a key reached the leaf
   * past every rule of its parent ({@code @EyesOnly}/{@code @ReadOnlyUnless} on {@code pay}) and
   * past any bean a view exposes through a getter (GA round 2, J2/J3). The same map when there is
   * none.
   */
  public static Map<String, Object> withoutDottedKeys(Map<String, Object> state) {
    if (state == null || state.isEmpty()) {
      return state;
    }
    Map<String, Object> out = null;
    for (var key : state.keySet()) {
      if (key != null && key.indexOf('.') >= 0) {
        if (out == null) {
          out = new LinkedHashMap<>(state);
        }
        out.remove(key);
      }
    }
    return out == null ? state : out;
  }

  /** The names of {@code type}'s own fields the caller may not READ. */
  public static List<String> unreadable(Class<?> type, HttpRequest httpRequest) {
    var shape = SHAPES.get(type);
    if (!shape.guardedAnywhere()) {
      return List.of();
    }
    var out = new ArrayList<String>();
    for (var slot : shape.slots().values()) {
      if (slot.guarded() && !mayRead(slot.field(), httpRequest)) {
        out.add(slot.field().getName());
      }
    }
    return out;
  }

  /** Whether {@code type} (or something nested in it) carries an access annotation. */
  public static boolean isGuarded(Class<?> type) {
    return type != null && SHAPES.get(type).guardedAnywhere();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> walk(
      Class<?> type,
      Object source,
      Map<String, Object> state,
      HttpRequest rq,
      boolean write,
      int depth) {
    if (type == null || state == null || state.isEmpty() || depth > MAX_DEPTH) {
      return state;
    }
    var shape = SHAPES.get(type);
    if (!shape.guardedAnywhere()) {
      return state;
    }
    Map<String, Object> out = null;
    for (var entry : state.entrySet()) {
      var key = entry.getKey();
      if (key == null) {
        continue;
      }
      var dash = key.indexOf('-');
      var name = dash > 0 ? key.substring(0, dash) : key;
      var slot = shape.slots().get(name);
      if (slot == null) {
        continue;
      }
      Object replacement = entry.getValue();
      var drop = slot.guarded() && !allowed(slot.field(), rq, write);
      var held = slot.nested() != null ? valueIn(slot.field(), source) : null;
      if (!drop && dash > 0 && slot.nested() != null && !slot.many() && !slot.keyed()) {
        // a flattened key of an inline nested form: pay-salary is pay's salary
        drop =
            !allowedPath(
                runtimeType(slot.nested(), held), key.substring(dash + 1), rq, write, depth + 1);
      } else if (!drop && slot.nested() != null && dash < 0) {
        replacement = nestedValue(slot, held, entry.getValue(), rq, write, depth);
      }
      if (drop || replacement != entry.getValue()) {
        if (out == null) {
          out = new LinkedHashMap<>(state);
        }
        if (drop) {
          out.remove(key);
        } else {
          out.put(key, replacement);
        }
      }
    }
    return out == null ? state : out;
  }

  @SuppressWarnings("unchecked")
  private static Object nestedValue(
      Slot slot, Object held, Object value, HttpRequest rq, boolean write, int depth) {
    if (slot.keyed() && value instanceof Map<?, ?> map) {
      Map<Object, Object> copy = null;
      for (var entry : map.entrySet()) {
        if (entry.getValue() instanceof Map<?, ?> item) {
          var element = held instanceof Map<?, ?> heldMap ? heldMap.get(entry.getKey()) : null;
          var narrowed =
              walk(
                  runtimeType(slot.nested(), element),
                  element,
                  (Map<String, Object>) item,
                  rq,
                  write,
                  depth + 1);
          if (narrowed != item) {
            if (copy == null) {
              copy = new LinkedHashMap<>(map);
            }
            copy.put(entry.getKey(), narrowed);
          }
        }
      }
      return copy == null ? value : copy;
    }
    if (!slot.many() && value instanceof Map<?, ?> map) {
      var element = held instanceof java.util.Optional<?> optional ? optional.orElse(null) : held;
      return walk(
          runtimeType(slot.nested(), element),
          element,
          (Map<String, Object>) map,
          rq,
          write,
          depth + 1);
    }
    if (slot.many() && value instanceof List<?> list) {
      List<Object> copy = null;
      for (int i = 0; i < list.size(); i++) {
        var item = list.get(i);
        if (item instanceof Map<?, ?> map) {
          var element = elementAt(held, i);
          var narrowed =
              walk(
                  runtimeType(slot.nested(), element),
                  element,
                  (Map<String, Object>) map,
                  rq,
                  write,
                  depth + 1);
          if (narrowed != item) {
            if (copy == null) {
              copy = new ArrayList<>(list);
            }
            copy.set(i, narrowed);
          }
        }
      }
      return copy == null ? value : copy;
    }
    return value;
  }

  /** {@code declared}, or the runtime class of {@code value} when it is a subclass of it. */
  private static Class<?> runtimeType(Class<?> declared, Object value) {
    if (value == null || value.getClass() == declared || !declared.isInstance(value)) {
      return declared;
    }
    return isApplicationType(value.getClass()) ? value.getClass() : declared;
  }

  /** The value of {@code field} in {@code source}, or null when there is no source or it fails. */
  private static Object valueIn(Field field, Object source) {
    if (source == null || !field.getDeclaringClass().isInstance(source)) {
      return null;
    }
    try {
      field.setAccessible(true);
      return field.get(source);
    } catch (ReflectiveOperationException | RuntimeException e) {
      return null;
    }
  }

  /** The {@code index}-th element of a list or array, or null. */
  private static Object elementAt(Object held, int index) {
    if (held instanceof List<?> list) {
      return index < list.size() ? list.get(index) : null;
    }
    if (held instanceof Collection<?> collection) {
      return collection.stream().skip(index).findFirst().orElse(null);
    }
    if (held != null && held.getClass().isArray()) {
      return index < java.lang.reflect.Array.getLength(held)
          ? java.lang.reflect.Array.get(held, index)
          : null;
    }
    return null;
  }

  private static boolean allowedPath(
      Class<?> type, String path, HttpRequest rq, boolean write, int depth) {
    if (depth > MAX_DEPTH) {
      return true;
    }
    var dash = path.indexOf('-');
    var name = dash > 0 ? path.substring(0, dash) : path;
    var slot = SHAPES.get(type).slots().get(name);
    if (slot == null) {
      return true;
    }
    if (slot.guarded() && !allowed(slot.field(), rq, write)) {
      return false;
    }
    return dash < 0
        || slot.nested() == null
        || allowedPath(slot.nested(), path.substring(dash + 1), rq, write, depth + 1);
  }

  private static boolean allowed(Field field, HttpRequest rq, boolean write) {
    return write ? mayWrite(field, rq) : mayRead(field, rq);
  }
}
