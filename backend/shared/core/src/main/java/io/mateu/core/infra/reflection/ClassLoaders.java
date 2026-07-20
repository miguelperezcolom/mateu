package io.mateu.core.infra.reflection;

/**
 * Loads classes by name, falling back to the thread context classloader. Plain {@code
 * Class.forName} uses the caller's defining classloader, which cannot see application classes in
 * Quarkus test/dev mode (app classes live in a child QuarkusClassLoader while dependencies, like
 * this jar, sit in the parent loader).
 */
public class ClassLoaders {

  public static Class<?> forName(String className) throws ClassNotFoundException {
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      return Thread.currentThread().getContextClassLoader().loadClass(className);
    }
  }
}
