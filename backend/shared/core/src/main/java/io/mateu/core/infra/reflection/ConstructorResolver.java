package io.mateu.core.infra.reflection;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
final class ConstructorResolver {

  // Warn at most once per class, so repeated form renders/saves do not spam the log.
  private static final Set<String> ambiguityWarned = ConcurrentHashMap.newKeySet();
  private static final Set<String> unnamedWarned = ConcurrentHashMap.newKeySet();

  static Constructor<?> getConstructor(Class<?> type) {
    // Records are always instantiated through their canonical constructor. It exposes every
    // component and javac emits reliable parameter names for it even without -parameters (extra,
    // non-canonical constructors do not carry names unless -parameters is set). Picking any smaller
    // convenience overload would bind form fields by synthetic argN names and silently yield an
    // empty instance.
    if (type.isRecord()) {
      Constructor<?> canonical = canonicalRecordConstructor(type);
      if (canonical != null) {
        makeAccessibleIfNeeded(canonical);
        return canonical;
      }
    }

    Constructor<?> con = null;
    int minParams = Integer.MAX_VALUE;
    for (Constructor<?> x : type.getConstructors()) {
      if (Modifier.isPublic(x.getModifiers()) && x.getParameterCount() < minParams) {
        con = x;
        minParams = con.getParameterCount();
      }
    }
    if (con == null) {
      for (Constructor<?> x : type.getDeclaredConstructors()) {
        if (Modifier.isProtected(x.getModifiers()) && x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
      }
    }
    if (con == null) {
      for (Constructor<?> x : type.getDeclaredConstructors()) {
        if (x.getParameterCount() < minParams) {
          con = x;
          minParams = con.getParameterCount();
        }
      }
    }
    // A non-record with several public constructors is ambiguous: Mateu picks the one with the
    // fewest parameters, so any field not present in it is dropped from the built instance. Warn so
    // this is diagnosable instead of silently losing form values.
    if (con != null
        && con.getParameterCount() > 0
        && type.getConstructors().length > 1
        && ambiguityWarned.add(type.getName())) {
      log.warn(
          "{} declares {} public constructors; Mateu builds form instances via the one with the "
              + "fewest parameters ({} args), so fields absent from it are dropped. Keep a single "
              + "constructor, or make it a record (its canonical constructor is always used).",
          type.getName(),
          type.getConstructors().length,
          con.getParameterCount());
    }
    if (con != null
        && (!Modifier.isPublic(con.getModifiers())
            || !Modifier.isPublic(con.getDeclaringClass().getModifiers()))) {
      // a public constructor on a package-private class is still inaccessible reflectively
      con.setAccessible(true);
    }
    return con;
  }

  private static Constructor<?> canonicalRecordConstructor(Class<?> type) {
    RecordComponent[] components = type.getRecordComponents();
    Class<?>[] paramTypes = new Class<?>[components.length];
    for (int i = 0; i < components.length; i++) {
      paramTypes[i] = components[i].getType();
    }
    try {
      return type.getDeclaredConstructor(paramTypes);
    } catch (NoSuchMethodException e) {
      log.warn("Could not resolve the canonical constructor of record {}", type.getName(), e);
      return null;
    }
  }

  private static void makeAccessibleIfNeeded(Constructor<?> con) {
    if (!Modifier.isPublic(con.getModifiers())
        || !Modifier.isPublic(con.getDeclaringClass().getModifiers())) {
      con.setAccessible(true);
    }
  }

  static Object[] buildConstructorParams(
      Constructor<?> con,
      java.util.Map<String, Object> data,
      InstanceFactory factory,
      HttpRequest httpRequest)
      throws Exception {
    // Without a MethodParameters attribute (class compiled without -parameters) parameter names
    // fall back to arg0, arg1, ... so form data keyed by real field names binds to nothing and the
    // instance comes back empty. Warn once per class rather than failing silently.
    if (con.getParameterCount() > 0
        && data != null
        && !data.isEmpty()
        && !con.getParameters()[0].isNamePresent()
        && unnamedWarned.add(con.getDeclaringClass().getName())) {
      log.warn(
          "Parameter names are unavailable on the constructor of {} (compiled without "
              + "-parameters); form fields cannot be bound by name and values will be lost. Compile "
              + "with -parameters or use a record.",
          con.getDeclaringClass().getName());
    }
    List<Object> params = new ArrayList<>();
    for (Parameter parameter : con.getParameters()) {
      params.add(
          ReflectionTypeCoercer.coerce(
              parameter.getType(),
              data.get(parameter.getName()),
              httpRequest,
              getGenericClass(parameter.getParameterizedType()),
              (ReflectionInstanceFactory) factory));
    }
    return params.toArray();
  }
}
