package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.jar.JarFile;
import lombok.extern.slf4j.Slf4j;

/**
 * Every {@code *.yaml}/{@code *.yml} file under {@code specs/ui/**} of one classloader, found by
 * ONE walk of the classpath and parsed ONCE.
 *
 * <p>The file kinds discovered by their {@code type:} header (mounts, route files, the project
 * descriptor, action catalogues, field types, translations, environments) used to walk the
 * classpath each on its own and re-read every file's header to find theirs — seven walks and seven
 * parses of every file to build the registries once. They all read this index instead.
 *
 * <p>The index is cached per classloader (weakly) and dropped, before anything else, whenever the
 * specs change in development mode ({@link io.mateu.core.infra.dev.DevSpecs#invalidateAll()}).
 * Outside development mode the classpath does not change, so one index lives as long as its
 * classloader.
 *
 * <p>{@link #tree(String)} answers a COPY of the parsed file, so a reader may modify what it gets
 * without affecting the next one. A file that does not parse keeps its failure, and {@link
 * #tree(String)} throws it again for each reader — each reports it in its own words, exactly as
 * when each parsed the file itself.
 */
@Slf4j
public final class SpecsIndex {

  static final String ROOT = "specs/ui";

  private static final ObjectMapper YAML = SpecsYaml.mapper();

  private static final Map<ClassLoader, SpecsIndex> BY_CLASSLOADER =
      Collections.synchronizedMap(new WeakHashMap<>());

  private static final AtomicInteger WALKS = new AtomicInteger();

  private static final AtomicInteger PARSES = new AtomicInteger();

  static {
    io.mateu.core.infra.dev.DevSpecs.registerIndex(SpecsIndex::invalidateAll);
  }

  /** One file: its parsed tree, or the failure reading it. */
  private record Entry(JsonNode tree, IOException failure) {}

  private final Map<String, Entry> files;

  private SpecsIndex(Map<String, Entry> files) {
    this.files = files;
  }

  /** The index of {@code classLoader}'s {@code specs/ui/**}, built on first use. */
  public static SpecsIndex of(ClassLoader classLoader) {
    var cl = classLoader != null ? classLoader : SpecsIndex.class.getClassLoader();
    var cached = BY_CLASSLOADER.get(cl);
    if (cached != null) {
      return cached;
    }
    // built outside the lock (a walk reads jars); two racing builders produce equal indexes
    var built = build(cl);
    var raced = BY_CLASSLOADER.putIfAbsent(cl, built);
    return raced != null ? raced : built;
  }

  /** Drops every cached index: the next read walks the classpath again. */
  public static void invalidateAll() {
    BY_CLASSLOADER.clear();
  }

  /** Every spec file's resource path, in discovery order. */
  public Set<String> paths() {
    return Collections.unmodifiableSet(files.keySet());
  }

  /**
   * The {@code type:} a file declares, or {@code ""} when it declares none, is not a mapping, does
   * not parse or is not in the index.
   */
  public String type(String path) {
    var entry = files.get(path);
    if (entry == null || entry.tree() == null) {
      return "";
    }
    var root = entry.tree();
    return root.isObject() && root.hasNonNull("type") ? root.get("type").asText() : "";
  }

  /**
   * A copy of the file's parsed tree; {@code null} when the file is empty or not in the index.
   *
   * @throws IOException the failure parsing it, when it does not parse
   */
  public JsonNode tree(String path) throws IOException {
    var entry = files.get(path);
    if (entry == null) {
      return null;
    }
    if (entry.failure() != null) {
      throw entry.failure();
    }
    return entry.tree() == null ? null : entry.tree().deepCopy();
  }

  /**
   * The files of one kind, in the order their entries merge (a later file's entry replaces an
   * earlier one of the same id): the conventional file first when it exists — with or without a
   * {@code type:} header — then every other file declaring {@code type}, in discovery order.
   */
  public static Set<String> filesOfType(ClassLoader cl, String type, String conventionalPath) {
    var files = new LinkedHashSet<String>();
    if (conventionalPath != null && cl.getResource(conventionalPath) != null) {
      files.add(conventionalPath);
    }
    var index = of(cl);
    for (var path : index.paths()) {
      if (!path.equals(conventionalPath) && type.equals(index.type(path))) {
        files.add(path);
      }
    }
    return files;
  }

  /**
   * A copy of the parsed spec file at {@code path}: from the index when the walk found it, else
   * read directly (a conventional file on a classpath the walk cannot list, such as a native
   * image's resources). {@code null} when there is no such file.
   *
   * @throws IOException the failure parsing it
   */
  public static JsonNode treeOf(ClassLoader cl, String path) throws IOException {
    var index = of(cl);
    if (index.files.containsKey(path)) {
      return index.tree(path);
    }
    try (InputStream is = cl.getResourceAsStream(path)) {
      return is == null ? null : YAML.readTree(is);
    }
  }

  /** How many times the classpath was walked for {@code specs/ui} (diagnostics and tests). */
  static int walks() {
    return WALKS.get();
  }

  /** How many spec files were parsed (diagnostics and tests). */
  static int parses() {
    return PARSES.get();
  }

  private static SpecsIndex build(ClassLoader cl) {
    var files = new LinkedHashMap<String, Entry>();
    for (var path : scan(cl)) {
      files.put(path, read(cl, path));
    }
    return new SpecsIndex(Collections.unmodifiableMap(files));
  }

  private static Entry read(ClassLoader cl, String path) {
    PARSES.incrementAndGet();
    try (InputStream is = cl.getResourceAsStream(path)) {
      if (is == null) {
        return new Entry(null, null);
      }
      return new Entry(YAML.readTree(is), null);
    } catch (IOException e) {
      return new Entry(null, e);
    } catch (RuntimeException e) {
      return new Entry(null, new IOException(e.getMessage(), e));
    }
  }

  /** Every {@code *.yaml}/{@code *.yml} resource path under {@code specs/ui/} (recursive). */
  static Set<String> scan(ClassLoader cl) {
    WALKS.incrementAndGet();
    var paths = new LinkedHashSet<String>();
    try {
      var urls = cl.getResources(ROOT);
      while (urls.hasMoreElements()) {
        var url = urls.nextElement();
        switch (url.getProtocol()) {
          case "file" -> scanDir(new File(url.toURI()), ROOT, paths);
          case "jar" -> scanJar(url, paths);
          default -> {}
        }
      }
    } catch (Exception e) {
      log.warn("Failed to scan {} for mounts: {}", ROOT, e.getMessage());
    }
    return paths;
  }

  private static void scanDir(File dir, String resourcePrefix, Set<String> out) {
    var children = dir.listFiles();
    if (children == null) {
      return;
    }
    for (var child : children) {
      var childPath = resourcePrefix + "/" + child.getName();
      if (child.isDirectory()) {
        scanDir(child, childPath, out);
      } else if (isYaml(child.getName())) {
        out.add(childPath);
      }
    }
  }

  private static void scanJar(java.net.URL url, Set<String> out) throws Exception {
    var connection = (JarURLConnection) url.openConnection();
    // our own JarFile, not the one the JVM caches for every jar: URL of this file — closing the
    // shared one makes a reader in flight (a classloader, another request) fail "zip file closed"
    connection.setUseCaches(false);
    try (JarFile jar = connection.getJarFile()) {
      var prefix = ROOT + "/";
      jar.stream()
          .map(java.util.jar.JarEntry::getName)
          .filter(name -> name.startsWith(prefix) && isYaml(name))
          .forEach(out::add);
    }
  }

  private static boolean isYaml(String name) {
    return name.endsWith(".yaml") || name.endsWith(".yml");
  }
}
