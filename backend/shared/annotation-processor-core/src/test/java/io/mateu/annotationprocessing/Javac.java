package io.mateu.annotationprocessing;

import io.mateu.uidl.annotations.UI;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;
import javax.annotation.processing.Processor;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

/**
 * Runs the real javac over in-memory sources with the given processors — what a consumer's build
 * does — and exposes what came out: the diagnostics, the generated sources and the class output
 * (where an indexer writes its resource). Processing only ({@code -proc:only}): the generated
 * controllers target a web framework that is not on this module's classpath.
 */
final class Javac {

  record Result(
      List<Diagnostic<? extends JavaFileObject>> diagnostics, Path generated, Path classes) {

    /**
     * The errors reported on the compiled sources. The generated files are not attributed here
     * (they need the web framework), so what javac says about them is not the processor's verdict.
     */
    List<String> errors() {
      return diagnostics.stream()
          .filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
          .filter(d -> d.getSource() == null || d.getSource() instanceof Source)
          .map(d -> d.getMessage(Locale.ROOT))
          .toList();
    }

    boolean hasGenerated(String className) {
      return Files.exists(sourcePath(className));
    }

    String generatedSource(String className) {
      try {
        return Files.readString(sourcePath(className));
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }

    List<String> generatedClassNames() {
      try (Stream<Path> walk = Files.walk(generated)) {
        return walk.filter(p -> p.toString().endsWith(".java"))
            .map(p -> generated.relativize(p).toString())
            .map(
                s -> s.substring(0, s.length() - ".java".length()).replace(File.separatorChar, '.'))
            .sorted()
            .toList();
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }

    private Path sourcePath(String className) {
      return generated.resolve(className.replace('.', File.separatorChar) + ".java");
    }
  }

  /** {@code sources}: fully qualified class name → its source code. */
  static Result compile(List<Processor> processors, Map<String, String> sources) {
    try {
      Path generated = Files.createTempDirectory("mateu-ap-gen");
      Path classes = Files.createTempDirectory("mateu-ap-classes");
      JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
      DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
      try (StandardJavaFileManager files = javac.getStandardFileManager(diagnostics, null, null)) {
        List<String> options =
            List.of(
                "-proc:only",
                "-classpath",
                classpath(),
                "-s",
                generated.toString(),
                "-d",
                classes.toString());
        List<JavaFileObject> units = new ArrayList<>();
        sources.forEach((name, code) -> units.add(new Source(name, code)));
        JavaCompiler.CompilationTask task =
            javac.getTask(null, files, diagnostics, options, null, units);
        task.setProcessors(processors);
        task.call();
      }
      return new Result(diagnostics.getDiagnostics(), generated, classes);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  /** The test classpath plus uidl's location (surefire may hand us a manifest-only jar). */
  private static String classpath() {
    try {
      String uidl =
          Path.of(UI.class.getProtectionDomain().getCodeSource().getLocation().toURI()).toString();
      return System.getProperty("java.class.path") + File.pathSeparator + uidl;
    } catch (URISyntaxException e) {
      throw new IllegalStateException(e);
    }
  }

  private static final class Source extends SimpleJavaFileObject {
    private final String code;

    Source(String className, String code) {
      super(
          URI.create("string:///" + className.replace('.', '/') + Kind.SOURCE.extension),
          Kind.SOURCE);
      this.code = code;
    }

    @Override
    public CharSequence getCharContent(boolean ignoreEncodingErrors) {
      return code;
    }
  }

  private Javac() {}
}
