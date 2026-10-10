package io.mateu.core.testutil;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Enumeration;
import java.util.Map;
import java.util.function.Function;

/**
 * A throwaway {@code specs/ui} tree for one test: the files are written to a directory and served
 * through a class loader that answers {@code specs/ui/**} ONLY from it (everything else from the
 * test class path), set as the thread's context class loader while the body runs. The shared test
 * {@code specs/ui} neither leaks in nor is changed for the other suites — the same isolation as
 * {@code MountHomeSyncTest}, with the fixtures written inline next to the assertions.
 */
public final class SpecsDir {

  private SpecsDir() {}

  /** Writes {@code files} (path under {@code specs/ui/} → content) into {@code root}. */
  public static Path write(Path root, Map<String, String> files) {
    try {
      for (var entry : files.entrySet()) {
        var file = root.resolve("specs/ui").resolve(entry.getKey());
        Files.createDirectories(file.getParent());
        Files.writeString(file, entry.getValue());
      }
      return root;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  /** Runs {@code body} with {@code root}'s {@code specs/ui} as the only one on the class path. */
  public static <T> T over(Path root, Function<ClassLoader, T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    var overlay = new Overlay(root, SpecsDir.class.getClassLoader());
    thread.setContextClassLoader(overlay);
    try {
      return body.apply(overlay);
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  /** Serves {@code specs/ui/**} from one directory; everything else from the parent. */
  static final class Overlay extends ClassLoader {
    private final URLClassLoader specs;

    Overlay(Path root, ClassLoader parent) {
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
    public java.io.InputStream getResourceAsStream(String name) {
      if (isSpec(name)) {
        return specs.getResourceAsStream(name);
      }
      return super.getResourceAsStream(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isSpec(name) ? specs.getResources(name) : super.getResources(name);
    }
  }
}
