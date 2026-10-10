package io.mateu.core.infra.dev;

/**
 * Anything that reads {@code specs/ui/**} once and keeps the result: a registry, a catalogue, a
 * parsed-definition cache. In development mode ({@link DevMode}) the specs are edited while the app
 * runs, so every such cache has to be dropped when a file changes.
 *
 * <p><b>The hook for a new catalogue is one line</b>: implement this interface and register the
 * instance from its constructor —
 *
 * <pre>{@code
 * public MyCatalogue() {
 *   DevSpecs.register(this);
 * }
 *
 * @Override
 * public void invalidateSpecs() {
 *   catalog = null; // the next read loads it again
 * }
 * }</pre>
 *
 * Registration is weak (a registry that is garbage-collected is simply forgotten) and costs nothing
 * outside development mode — {@link #invalidateSpecs()} is only ever called when a spec changes, a
 * reload is requested, or dev mode is switched on after the cache was first filled.
 *
 * <p>Read the files through {@link DevSpecs#classLoader(ClassLoader)} so that, in dev mode, they
 * come from the SOURCE directory rather than the classpath copy the build made.
 */
@FunctionalInterface
public interface SpecsCache {

  /** Drops whatever was loaded from {@code specs/ui/**}; the next read loads it again. */
  void invalidateSpecs();
}
