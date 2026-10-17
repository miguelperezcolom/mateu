package io.mateu.annotationprocessing.indexer;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.UI;
import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;
import org.junit.Test;

/**
 * The indexer as a UI module's build runs it: javac over real sources, and the index it leaves in
 * the module's classes — what every framework AP reads from the jar. A class missing from it is a
 * mount whose controllers are never generated, so its routes 404.
 */
public class IndexerCompileTest {

  /** The index written for {@code sources}, or {@code null} when none was written. */
  private static String index(Map<String, String> sources) throws Exception {
    return compile(List.of(new MateuUIIndexerProcessor()), sources).index;
  }

  private record Compiled(String index, List<String> errors) {}

  private static Compiled compile(
      List<javax.annotation.processing.Processor> processors, Map<String, String> sources)
      throws Exception {
    Path classes = Files.createTempDirectory("mateu-indexer");
    JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
    DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
    String uidl =
        Path.of(UI.class.getProtectionDomain().getCodeSource().getLocation().toURI()).toString();
    List<JavaFileObject> units = new ArrayList<>();
    sources.forEach(
        (name, code) ->
            units.add(
                new SimpleJavaFileObject(
                    URI.create("string:///" + name.replace('.', '/') + ".java"),
                    JavaFileObject.Kind.SOURCE) {
                  @Override
                  public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                    return code;
                  }
                }));
    try (var files = javac.getStandardFileManager(diagnostics, null, null)) {
      var task =
          javac.getTask(
              null,
              files,
              diagnostics,
              List.of(
                  "-proc:only",
                  "-classpath",
                  System.getProperty("java.class.path") + File.pathSeparator + uidl,
                  "-d",
                  classes.toString()),
              null,
              units);
      task.setProcessors(processors);
      task.call();
    }
    Path index = classes.resolve("META-INF/mateu/ui-registrations");
    return new Compiled(
        Files.exists(index) ? Files.readString(index) : null,
        diagnostics.getDiagnostics().stream()
            .filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
            .map(d -> d.getMessage(Locale.ROOT))
            .toList());
  }

  @Test
  public void everyMountOfTheModuleIsIndexedSeparatedByDashes() throws Exception {
    String index =
        index(
            Map.of(
                "com.acme.A",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"/a\") public class A {}",
                "com.acme.B",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"/b\") public class B {}"));

    assertThat(index).contains("class=com.acme.A\n").contains("class=com.acme.B\n");
    assertThat(index.split("\n---\n")).hasSize(2);
  }

  @Test
  public void headTagsAreIndexedInDeclarationOrder() throws Exception {
    String index =
        index(
            Map.of(
                "com.acme.Head",
                """
                package com.acme;
                import io.mateu.uidl.annotations.*;
                @UI("/head")
                @Script(src = "/one.js", type = "module", defer = true)
                @Script(src = "/two.js", async = true, crossorigin = true)
                @Link(rel = "stylesheet", href = "/app.css", type = "text/css")
                @Meta(name = "robots", content = "noindex")
                @Meta(httpEquiv = "refresh", content = "30", charset = "utf-8")
                public class Head {}
                """));

    assertThat(index)
        .contains(
            "script.0.src=/one.js\nscript.0.type=module\nscript.0.crossorigin=false\n"
                + "script.0.defer=true\nscript.0.async=false\n")
        .contains(
            "script.1.src=/two.js\nscript.1.type=\nscript.1.crossorigin=true\n"
                + "script.1.defer=false\nscript.1.async=true\n")
        .contains(
            "link.0.rel=stylesheet\nlink.0.href=/app.css\nlink.0.type=text/css\nlink.0.as=\n"
                + "link.0.crossorigin=false\n")
        .contains(
            "meta.0.name=robots\nmeta.0.content=noindex\nmeta.0.httpEquiv=\nmeta.0.charset=\n")
        .contains(
            "meta.1.name=\nmeta.1.content=30\nmeta.1.httpEquiv=refresh\nmeta.1.charset=utf-8\n");
  }

  /** {@code @App(route)} wins, and a class carrying both annotations is indexed once. */
  @Test
  public void appRouteWinsAndAClassWithBothAnnotationsIsIndexedOnce() throws Exception {
    String index =
        index(
            Map.of(
                "com.acme.Both",
                """
                package com.acme;
                @io.mateu.uidl.annotations.UI(value = "/old", frontendComponentPath = "/b.js")
                @io.mateu.uidl.annotations.App(route = "/new")
                public class Both {}
                """));

    assertThat(index).contains("path=/new\n").contains("frontendComponentPath=/b.js\n");
    assertThat(index).doesNotContain("---").doesNotContain("/old");
  }

  /** Routed only by {@code @App(route)}: no {@code @UI} to read the frontend paths from. */
  @Test
  public void anAppOnlyMountIsIndexedWithTheUiDefaults() throws Exception {
    String index =
        index(
            Map.of(
                "com.acme.Store",
                "package com.acme; @io.mateu.uidl.annotations.App(route = \"/store\") public class"
                    + " Store {}"));

    assertThat(index)
        .contains("path=/store\n")
        .contains("indexHtmlPath=/static/_index.html\n")
        .contains("frontendComponentPath=/assets/mateu.js\n");
  }

  @Test
  public void aModuleWithoutMountsWritesNoIndex() throws Exception {
    String index =
        index(
            Map.of(
                "com.acme.Chrome",
                "package com.acme; @io.mateu.uidl.annotations.App(themeToggle = true) public class"
                    + " Chrome {}",
                "com.acme.Plain",
                "package com.acme; public class Plain {}"));

    assertThat(index).isNull();
  }

  /** The indexer must not claim @UI: the framework AP compiling the same module still needs it. */
  @Test
  public void theFrameworkApOfTheSameCompilationStillSeesTheMount() throws Exception {
    var seen = new SeesUi();
    var compiled =
        compile(
            List.of(new MateuUIIndexerProcessor(), seen),
            Map.of(
                "com.acme.A",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"/a\") public class A {}"));

    assertThat(compiled.errors()).isEmpty();
    assertThat(compiled.index()).contains("class=com.acme.A\n");
    assertThat(seen.mounts).containsExactly("com.acme.A");
  }

  @SupportedAnnotationTypes("io.mateu.uidl.annotations.UI")
  @SupportedSourceVersion(SourceVersion.RELEASE_8)
  static class SeesUi extends AbstractProcessor {
    final List<String> mounts = new ArrayList<>();

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
      for (TypeElement a : annotations) {
        roundEnv.getElementsAnnotatedWith(a).stream()
            .map(e -> ((TypeElement) e).getQualifiedName().toString())
            .forEach(mounts::add);
      }
      return true;
    }
  }
}
