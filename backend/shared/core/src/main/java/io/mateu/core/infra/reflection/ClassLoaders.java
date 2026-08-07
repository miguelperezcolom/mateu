package io.mateu.core.infra.reflection;

/**
 * Loads classes by name, falling back to the thread context classloader. Plain {@code
 * Class.forName} uses the caller's defining classloader, which cannot see application classes in
 * Quarkus test/dev mode (app classes live in a child QuarkusClassLoader while dependencies, like
 * this jar, sit in the parent loader).
 */
public class ClassLoaders {

  /**
   * Load a class by name. A genuinely missing class throws an UNCHECKED {@link
   * IllegalStateException} naming it — so callers on the render/action path don't need
   * {@code @SneakyThrows} (whose sneaky rethrow masked the real cause as {@code
   * NoClassDefFoundError: lombok/Lombok} when lombok is off the runtime classpath), and the
   * missing-class name actually surfaces.
   */
  public static Class<?> forName(String className) {
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      try {
        return Thread.currentThread().getContextClassLoader().loadClass(className);
      } catch (ClassNotFoundException e2) {
        throw new IllegalStateException("Class not found: " + className, e2);
      }
    }
  }
}
