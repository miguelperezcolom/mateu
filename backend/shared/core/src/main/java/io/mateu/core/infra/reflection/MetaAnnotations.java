package io.mateu.core.infra.reflection;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.util.HashSet;
import java.util.Set;

/**
 * Resolves <b>semantic / composed</b> annotations: an annotation {@code A} is considered present on
 * an element either directly, or transitively through another annotation that is itself
 * meta-annotated with {@code A}.
 *
 * <p>This lets a developer define a single semantic annotation that bundles framework
 * configuration, e.g.
 *
 * <pre>{@code
 * @Retention(RUNTIME) @Target(FIELD)
 * @Lookup(search = SupplierOptions.class, label = SupplierLabel.class)
 * public @interface SupplierId {}
 * }</pre>
 *
 * and then annotate a field with just {@code @SupplierId}; the framework treats it as if it carried
 * the underlying {@code @Lookup} (with its attributes). Behaves like Spring's {@code
 * AnnotatedElementUtils.findMergedAnnotation} but minimal: it returns the first matching
 * meta-annotation found (no attribute overriding / {@code @AliasFor}).
 */
public final class MetaAnnotations {

  private MetaAnnotations() {}

  /** What the cache stores for "not present" (a ConcurrentHashMap cannot hold null). */
  private static final Object ABSENT = new Object();

  private record Key(AnnotatedElement element, Class<?> type) {}

  /**
   * Answers per declaring class, so a class unloaded (a dev-tools restart, a redeploy) takes its
   * entries with it — a static map keyed by Field/Method would pin every class it ever saw. With
   * ~560 call sites resolving the same annotations on every request, walking the composed
   * annotations each time was measurable work for an answer that never changes.
   */
  private static final ClassValue<java.util.concurrent.ConcurrentHashMap<Key, Object>> CACHE =
      new ClassValue<>() {
        @Override
        protected java.util.concurrent.ConcurrentHashMap<Key, Object> computeValue(Class<?> type) {
          return new java.util.concurrent.ConcurrentHashMap<>();
        }
      };

  /** The {@code A} annotation present on {@code element} directly or via a composed annotation. */
  @SuppressWarnings("unchecked")
  public static <A extends Annotation> A find(AnnotatedElement element, Class<A> type) {
    if (element == null) {
      return null;
    }
    var owner = ownerOf(element);
    if (owner == null) {
      return resolve(element, type); // an element we cannot key safely: not cached
    }
    var cached =
        CACHE
            .get(owner)
            .computeIfAbsent(
                new Key(element, type),
                key -> {
                  var found = resolve(element, type);
                  return found != null ? found : ABSENT;
                });
    return cached == ABSENT ? null : (A) cached;
  }

  /** The class whose lifetime an element's annotations share, or null for an unknown element. */
  private static Class<?> ownerOf(AnnotatedElement element) {
    if (element instanceof Class<?> c) {
      return c;
    }
    if (element instanceof java.lang.reflect.Member member) {
      return member.getDeclaringClass();
    }
    if (element instanceof java.lang.reflect.Parameter parameter) {
      return parameter.getDeclaringExecutable().getDeclaringClass();
    }
    if (element instanceof java.lang.reflect.RecordComponent component) {
      return component.getDeclaringRecord();
    }
    return null;
  }

  private static <A extends Annotation> A resolve(AnnotatedElement element, Class<A> type) {
    var direct = element.getAnnotation(type);
    if (direct != null) {
      return direct;
    }
    return findOnComposed(element.getAnnotations(), type, new HashSet<>());
  }

  /** Whether {@code A} is present on {@code element} directly or via a composed annotation. */
  public static boolean isPresent(AnnotatedElement element, Class<? extends Annotation> type) {
    return find(element, type) != null;
  }

  private static <A extends Annotation> A findOnComposed(
      Annotation[] annotations, Class<A> type, Set<Class<?>> visited) {
    for (var annotation : annotations) {
      var annotationType = annotation.annotationType();
      // Skip JDK meta-annotations (@Retention, @Target, …) and break cycles.
      if (annotationType.getName().startsWith("java.lang.annotation")
          || !visited.add(annotationType)) {
        continue;
      }
      var meta = annotationType.getAnnotation(type);
      if (meta != null) {
        return meta;
      }
      var nested = findOnComposed(annotationType.getAnnotations(), type, visited);
      if (nested != null) {
        return nested;
      }
    }
    return null;
  }
}
