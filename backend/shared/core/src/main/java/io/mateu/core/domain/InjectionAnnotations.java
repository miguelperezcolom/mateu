package io.mateu.core.domain;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.util.HashSet;
import java.util.Set;

/**
 * THE rule for "this field is filled by the container": a dependency of the view, never UI state —
 * never a form field, never serialized into the component state, never written from the client.
 *
 * <p>Recognised BY ANNOTATION NAME, because core depends on no container: the fully qualified
 * injection annotations of Jakarta/javax Inject, Spring ({@code @Autowired}, {@code @Value}),
 * {@code @Resource} and Guice, plus — for the other frameworks Mateu runs on (JAX-RS
 * {@code @Context}, MicroProfile {@code @ConfigProperty}, Micronaut
 * {@code @Property}/{@code @Client}, JPA {@code @PersistenceContext}…) — their simple names. A
 * composed (meta-)annotation carrying one of them counts too.
 */
public final class InjectionAnnotations {

  private InjectionAnnotations() {}

  /** Injection annotations recognised by their fully qualified name. */
  public static final Set<String> QUALIFIED_NAMES =
      Set.of(
          "jakarta.inject.Inject",
          "javax.inject.Inject",
          "org.springframework.beans.factory.annotation.Autowired",
          "org.springframework.beans.factory.annotation.Value",
          "jakarta.annotation.Resource",
          "javax.annotation.Resource",
          "com.google.inject.Inject");

  /** Injection points recognised by their simple name (frameworks whose packages vary). */
  public static final Set<String> SIMPLE_NAMES =
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
   * Whether the container fills this field (or parameter/method) — directly or via a
   * meta-annotation.
   */
  public static boolean isInjected(AnnotatedElement element) {
    if (element == null) {
      return false;
    }
    for (var annotation : element.getAnnotations()) {
      if (INJECTION_TYPES.get(annotation.annotationType())) {
        return true;
      }
    }
    return false;
  }

  /** Per annotation type, decided once (the meta-annotation walk is not on every request). */
  private static final ClassValue<Boolean> INJECTION_TYPES =
      new ClassValue<>() {
        @Override
        @SuppressWarnings("unchecked")
        protected Boolean computeValue(Class<?> type) {
          return isInjection((Class<? extends Annotation>) type, new HashSet<>());
        }
      };

  private static boolean isInjection(Class<? extends Annotation> type, Set<Class<?>> visited) {
    if (QUALIFIED_NAMES.contains(type.getName()) || SIMPLE_NAMES.contains(type.getSimpleName())) {
      return true;
    }
    var name = type.getName();
    if (name.startsWith("java.lang.annotation.")
        || name.startsWith("kotlin.")
        || !visited.add(type)) {
      return false;
    }
    for (var meta : type.getAnnotations()) {
      if (isInjection(meta.annotationType(), visited)) {
        return true;
      }
    }
    return false;
  }
}
