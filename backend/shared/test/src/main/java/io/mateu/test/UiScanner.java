package io.mateu.test;

import io.mateu.uidl.annotations.UI;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Stream;

/** Finds the {@code @UI} classes of a package on the class path (directories and jars). */
final class UiScanner {

  private UiScanner() {}

  static List<Class<?>> uisIn(String pkg) {
    var loader = Thread.currentThread().getContextClassLoader();
    if (loader == null) {
      loader = UiScanner.class.getClassLoader();
    }
    var prefix = pkg.replace('.', '/');
    var names = new TreeSet<String>();
    try {
      for (URL url : Collections.list(loader.getResources(prefix))) {
        if ("file".equals(url.getProtocol())) {
          var dir = Path.of(url.toURI());
          try (Stream<Path> walk = Files.walk(dir)) {
            walk.filter(p -> p.toString().endsWith(".class"))
                .map(
                    p ->
                        prefix
                            + "/"
                            + dir.relativize(p).toString().replace(File.separatorChar, '/'))
                .forEach(names::add);
          }
        } else if ("jar".equals(url.getProtocol())
            && url.openConnection() instanceof JarURLConnection jar) {
          jar.setUseCaches(false);
          try (var file = jar.getJarFile()) {
            file.stream()
                .map(java.util.zip.ZipEntry::getName)
                .filter(n -> n.startsWith(prefix + "/") && n.endsWith(".class"))
                .forEach(names::add);
          }
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } catch (URISyntaxException e) {
      throw new IllegalStateException(e);
    }
    var out = new ArrayList<Class<?>>();
    for (String name : names) {
      if (name.contains("$")) {
        continue;
      }
      var className = name.substring(0, name.length() - ".class".length()).replace('/', '.');
      try {
        var type = Class.forName(className, false, loader);
        if (type.isAnnotationPresent(UI.class)) {
          out.add(type);
        }
      } catch (ClassNotFoundException | LinkageError ignored) {
        // not loadable in this test: not one of its UIs
      }
    }
    return out;
  }
}
