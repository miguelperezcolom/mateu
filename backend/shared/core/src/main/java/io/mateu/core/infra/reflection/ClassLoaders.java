package io.mateu.core.infra.reflection;

/**
 * Loads application classes by name: from the thread context classloader first, then from this
 * jar's own. Plain {@code Class.forName} uses the caller's defining classloader, which in a
 * restartable setup is the WRONG one: Quarkus dev/test mode keeps the app's classes in a child
 * QuarkusClassLoader (the parent cannot see them at all), and Spring Boot devtools keeps them in a
 * child RestartClassLoader while the parent, which also has {@code target/classes} on its path, can
 * load a SECOND copy of each — a class no bean is an instance of, whose {@code @Autowired} fields
 * then found no bean and whose {@code @Lookup} suppliers could not be obtained from the context.
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
    var context = Thread.currentThread().getContextClassLoader();
    if (context != null) {
      try {
        return Class.forName(className, true, context);
      } catch (ClassNotFoundException ignored) {
        // not visible there: fall back to the framework's own loader
      }
    }
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      throw new IllegalStateException("Class not found: " + className, e);
    }
  }
}
