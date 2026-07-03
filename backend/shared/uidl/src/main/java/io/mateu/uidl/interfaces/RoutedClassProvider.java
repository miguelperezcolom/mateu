package io.mateu.uidl.interfaces;

/**
 * Exposes the concrete class that a route resolves to. Implement {@link #routedClass()} to tell
 * Mateu which class to instantiate and render for the associated route.
 */
public interface RoutedClassProvider {

  Class<?> routedClass();
}
