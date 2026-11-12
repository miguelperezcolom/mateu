package io.mateu.test;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Path;
import java.util.Enumeration;

/** Serves {@code specs/ui/**} from one directory and everything else from the parent. */
final class SpecsOverlay extends ClassLoader {

  private final URLClassLoader specs;

  SpecsOverlay(Path root, ClassLoader parent) {
    super(parent);
    try {
      this.specs = new URLClassLoader(new URL[] {root.toUri().toURL()}, null);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static boolean isSpec(String name) {
    return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
  }

  @Override
  public URL getResource(String name) {
    return isSpec(name) ? specs.getResource(name) : super.getResource(name);
  }

  @Override
  public InputStream getResourceAsStream(String name) {
    return isSpec(name) ? specs.getResourceAsStream(name) : super.getResourceAsStream(name);
  }

  @Override
  public Enumeration<URL> getResources(String name) throws IOException {
    return isSpec(name) ? specs.getResources(name) : super.getResources(name);
  }
}
