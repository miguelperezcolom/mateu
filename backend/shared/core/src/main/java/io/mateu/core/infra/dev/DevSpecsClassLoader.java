package io.mateu.core.infra.dev;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * A view of a classloader where {@code specs/ui/**} resolves against the SOURCE directories first
 * (dev mode). Everything else — classes, other resources — is the parent's, untouched.
 *
 * <p>The build's copy of the same directory ({@code target/classes/specs/ui}, {@code
 * build/resources/main/specs/ui}…) is HIDDEN, not just outranked: otherwise a file deleted from the
 * sources would keep answering from its stale copy until the next build. Specs a JAR contributes
 * (another module, a library) are still found.
 */
final class DevSpecsClassLoader extends ClassLoader {

  private static final String SOURCE_SUFFIX = "src/main/resources/specs/ui";

  private final List<Path> dirs;

  /** The module roots whose build output must not shadow the sources (one per dir). */
  private final List<Path> moduleRoots;

  DevSpecsClassLoader(ClassLoader parent, List<Path> dirs) {
    super(parent);
    this.dirs = List.copyOf(dirs);
    var roots = new ArrayList<Path>();
    for (var dir : dirs) {
      var normalized = dir.toString().replace('\\', '/');
      if (normalized.endsWith(SOURCE_SUFFIX)) {
        var root = dir;
        for (int i = 0; i < 5; i++) {
          root = root.getParent();
        }
        if (root != null) {
          roots.add(root);
        }
      }
    }
    this.moduleRoots = List.copyOf(roots);
  }

  private static boolean isSpec(String name) {
    return name.equals(DevSpecs.ROOT) || name.startsWith(DevSpecs.ROOT + "/");
  }

  private static String strip(String name) {
    return name.startsWith("/") ? name.substring(1) : name;
  }

  @Override
  public URL getResource(String name) {
    var n = strip(name);
    if (!isSpec(n)) {
      return getParent().getResource(name);
    }
    var own = fromSources(n);
    if (own != null) {
      return own;
    }
    var inherited = getParent().getResource(n);
    return inherited != null && shadowed(inherited) ? null : inherited;
  }

  @Override
  public Enumeration<URL> getResources(String name) throws IOException {
    var n = strip(name);
    if (!isSpec(n)) {
      return getParent().getResources(name);
    }
    var urls = new LinkedHashSet<URL>();
    var relative = n.equals(DevSpecs.ROOT) ? "" : n.substring(DevSpecs.ROOT.length() + 1);
    for (var dir : dirs) {
      var file = relative.isEmpty() ? dir : dir.resolve(relative);
      if (Files.exists(file)) {
        urls.add(toUrl(file));
      }
    }
    var inherited = getParent().getResources(n);
    while (inherited.hasMoreElements()) {
      var url = inherited.nextElement();
      if (!shadowed(url)) {
        urls.add(url);
      }
    }
    return Collections.enumeration(urls);
  }

  private URL fromSources(String name) {
    var relative = name.equals(DevSpecs.ROOT) ? "" : name.substring(DevSpecs.ROOT.length() + 1);
    for (var dir : dirs) {
      var file = relative.isEmpty() ? dir : dir.resolve(relative);
      if (Files.exists(file)) {
        return toUrl(file);
      }
    }
    return null;
  }

  /** A {@code file:} URL inside one of the watched modules, other than the sources themselves. */
  private boolean shadowed(URL url) {
    if (!"file".equals(url.getProtocol())) {
      return false;
    }
    try {
      var path = Path.of(url.toURI()).toAbsolutePath().normalize();
      for (var dir : dirs) {
        if (path.startsWith(dir)) {
          return false;
        }
      }
      for (var root : moduleRoots) {
        if (path.startsWith(root)) {
          return true;
        }
      }
      return false;
    } catch (Exception e) {
      return false;
    }
  }

  private static URL toUrl(Path file) {
    try {
      return file.toUri().toURL();
    } catch (MalformedURLException e) {
      throw new IllegalStateException(e);
    }
  }
}
