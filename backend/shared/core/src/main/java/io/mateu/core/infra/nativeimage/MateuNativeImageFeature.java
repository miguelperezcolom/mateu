package io.mateu.core.infra.nativeimage;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Array;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.jar.JarFile;
import java.util.stream.Stream;
import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeReflection;

/**
 * GraalVM native-image support for Mateu on any runtime that builds with GraalVM directly
 * (Micronaut, Spring Boot, Helidon). Registered by {@code
 * META-INF/native-image/io.mateu/mateu-core/native-image.properties}, so an app gets it by having
 * mateu-core on its classpath; Quarkus has its own extension (quarkus-mateu) and this feature
 * stands aside there.
 *
 * <p>Mateu maps every view model REFLECTIVELY at run time: it instantiates the class a request
 * names, walks its fields, methods, record components and annotations, fills its state from the
 * form and invokes its actions — and reaches further classes by name (routes.yaml), through generic
 * arguments ({@code AutoCrud<Product>}) and {@code @Menu} fields. A walk of that graph would always
 * miss some, so the whole surface is registered instead:
 *
 * <ul>
 *   <li>every class of Mateu's own artifacts ({@code io.mateu.*});
 *   <li>every class of each APPLICATION entry of the classpath — a directory or jar one of whose
 *       classes refers to Mateu, or that carries {@code specs/ui}: third-party libraries never do;
 *   <li>arrays of those classes, and the arrays commons-beanutils' converters create reflectively.
 * </ul>
 *
 * A class whose members need a dependency the app does not have (OpenTelemetry, …) is left out. The
 * resources (renderer assets, {@code specs/}, PWA files) and the request proxy are declared in the
 * same directory's {@code reachability-metadata.json}.
 */
public final class MateuNativeImageFeature implements Feature {

  private static final byte[] MATEU_REFERENCE = "io/mateu/".getBytes(StandardCharsets.UTF_8);

  /** Arrays commons-beanutils' ConvertUtilsBean builds reflectively when it starts. */
  private static final List<Class<?>> CONVERTED =
      List.of(
          boolean.class,
          byte.class,
          char.class,
          double.class,
          float.class,
          int.class,
          long.class,
          short.class,
          java.io.File.class,
          Boolean.class,
          Byte.class,
          Character.class,
          Class.class,
          Double.class,
          Float.class,
          Integer.class,
          Long.class,
          Short.class,
          String.class,
          java.math.BigDecimal.class,
          java.math.BigInteger.class,
          java.net.URL.class,
          java.sql.Date.class,
          java.sql.Time.class,
          java.sql.Timestamp.class,
          java.util.Calendar.class,
          java.util.Date.class);

  @Override
  public String getDescription() {
    return "Registers Mateu's reflectively mapped classes (view models, records, enums)";
  }

  @Override
  public boolean isInConfiguration(IsInConfigurationAccess access) {
    // quarkus-mateu registers all this through Quarkus' own build steps
    return access.findClassByName("io.quarkus.runtime.Application") == null;
  }

  @Override
  public void beforeAnalysis(BeforeAnalysisAccess access) {
    for (Class<?> type : CONVERTED) {
      RuntimeReflection.register(Array.newInstance(type, 0).getClass());
    }
    for (Path entry : access.getApplicationClassPath()) {
      List<String> classes = classNames(entry);
      boolean application = !isMateuArtifact(classes) && isApplication(entry, classes);
      for (String name : classes) {
        if (name.startsWith("io.mateu.annotationprocessing.")) {
          continue;
        }
        if (application || name.startsWith("io.mateu.")) {
          register(access.findClassByName(name), application);
        }
      }
    }
  }

  private static void register(Class<?> type, boolean withArray) {
    if (type == null) {
      return;
    }
    try {
      // resolving the members first: a type naming an absent optional dependency throws here
      var constructors = type.getDeclaredConstructors();
      var methods = type.getDeclaredMethods();
      var fields = type.getDeclaredFields();
      RuntimeReflection.register(type);
      RuntimeReflection.register(constructors);
      RuntimeReflection.register(methods);
      RuntimeReflection.register(fields);
      if (type.isRecord()) {
        RuntimeReflection.registerAllRecordComponents(type);
      }
      if (withArray) {
        RuntimeReflection.register(Array.newInstance(type, 0).getClass());
      }
    } catch (LinkageError | TypeNotPresentException e) {
      // a dependency of this class is absent: it cannot be used at run time either
    }
  }

  private static boolean isMateuArtifact(List<String> classes) {
    return !classes.isEmpty() && classes.stream().allMatch(name -> name.startsWith("io.mateu."));
  }

  /** An entry with code of the app: it carries specs/ui, or one of its classes refers to Mateu. */
  private static boolean isApplication(Path entry, List<String> classes) {
    if (classes.isEmpty() && !hasSpecs(entry)) {
      return false;
    }
    if (hasSpecs(entry)) {
      return true;
    }
    for (String name : classes) {
      if (refersToMateu(entry, name)) {
        return true;
      }
    }
    return false;
  }

  private static boolean hasSpecs(Path entry) {
    if (Files.isDirectory(entry)) {
      return Files.isDirectory(entry.resolve("specs/ui"));
    }
    try (var jar = new JarFile(entry.toFile())) {
      return jar.getEntry("specs/ui/") != null
          || jar.stream().anyMatch(e -> e.getName().startsWith("specs/ui/"));
    } catch (IOException e) {
      return false;
    }
  }

  private static boolean refersToMateu(Path entry, String className) {
    String file = className.replace('.', '/') + ".class";
    try {
      byte[] bytes;
      if (Files.isDirectory(entry)) {
        bytes = Files.readAllBytes(entry.resolve(file));
      } else {
        try (var jar = new JarFile(entry.toFile());
            InputStream in = jar.getInputStream(jar.getEntry(file))) {
          bytes = in.readAllBytes();
        }
      }
      return indexOf(bytes, MATEU_REFERENCE) >= 0;
    } catch (IOException | RuntimeException e) {
      return false;
    }
  }

  private static int indexOf(byte[] data, byte[] pattern) {
    outer:
    for (int i = 0; i <= data.length - pattern.length; i++) {
      for (int j = 0; j < pattern.length; j++) {
        if (data[i + j] != pattern[j]) {
          continue outer;
        }
      }
      return i;
    }
    return -1;
  }

  private static List<String> classNames(Path entry) {
    List<String> names = new ArrayList<>();
    try {
      if (Files.isDirectory(entry)) {
        try (Stream<Path> walk = Files.walk(entry)) {
          walk.filter(p -> p.toString().endsWith(".class"))
              .map(p -> entry.relativize(p).toString())
              .map(MateuNativeImageFeature::toClassName)
              .forEach(names::add);
        }
      } else if (entry.toString().endsWith(".jar")) {
        try (var jar = new JarFile(entry.toFile())) {
          jar.stream()
              .map(java.util.jar.JarEntry::getName)
              .filter(n -> n.endsWith(".class") && !n.startsWith("META-INF/"))
              .map(MateuNativeImageFeature::toClassName)
              .forEach(names::add);
        }
      }
    } catch (IOException e) {
      // unreadable entry: nothing to register from it
    }
    names.removeIf(n -> n.endsWith("module-info") || n.endsWith("package-info"));
    return names;
  }

  private static String toClassName(String path) {
    return path.replace('\\', '/').replaceAll("\\.class$", "").replace('/', '.');
  }
}
