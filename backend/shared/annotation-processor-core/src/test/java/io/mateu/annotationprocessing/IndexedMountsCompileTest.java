package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.annotationprocessing.indexer.MateuUIIndexerProcessor;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import org.junit.Test;

/**
 * The two-step annotation processing as a consumer's build runs it: the UI module is compiled with
 * the indexer, which writes META-INF/mateu/ui-registrations into its classes; the app module, with
 * no {@code @UI} source of its own, is compiled with the framework AP, which must generate the
 * controllers of every indexed mount. A miss in either step is a mount that 404s at runtime.
 */
public class IndexedMountsCompileTest {

  private static final String UI_MODULE_HOME =
      """
      package com.acme.ui;
      import io.mateu.uidl.annotations.*;
      @UI("")
      @Meta(name = "theme-color", content = "#0a0a0a")
      @Link(rel = "icon", href = "/favicon.svg", type = "image/svg+xml")
      @Script(src = "/push.js", defer = true)
      public class Home {}
      """;

  private static final String UI_MODULE_SECURE =
      """
      package com.acme.ui;
      @io.mateu.uidl.annotations.UI(value = "/secure", frontendComponentPath = "/bundle/mateu.js")
      public class Secure {}
      """;

  private static final String APP_MODULE = "package com.acme.app; public class Application {}";

  private static Path compileUiModule() {
    var ui =
        Javac.compile(
            List.of(new MateuUIIndexerProcessor()),
            Map.of("com.acme.ui.Home", UI_MODULE_HOME, "com.acme.ui.Secure", UI_MODULE_SECURE));
    assertThat(ui.errors()).isEmpty();
    return ui.classes();
  }

  /**
   * The framework AP with the UI module on its processor path, as {@code annotationProcessorPaths}
   * does.
   */
  private static MateuIndexedUIProcessor frameworkApSeeing(Path uiModuleClasses) {
    try {
      return new SeeingProcessorPath(
          new URLClassLoader(new URL[] {uiModuleClasses.toUri().toURL()}, null));
    } catch (MalformedURLException e) {
      throw new IllegalStateException(e);
    }
  }

  /** Named, not anonymous: javac reads the supported annotation types off the concrete class. */
  @SupportedAnnotationTypes("*")
  @SupportedSourceVersion(SourceVersion.RELEASE_8)
  static class SeeingProcessorPath extends MateuIndexedUIProcessor {
    private final ClassLoader processorPath;

    SeeingProcessorPath(ClassLoader processorPath) {
      this.processorPath = processorPath;
    }

    @Override
    protected void processIndexedUIs(Set<String> compiledClassNames) {
      IndexedUIProcessor.process(compiledClassNames, getFiler(), processorPath);
    }
  }

  @Test
  public void anAppModuleWithoutUiSourcesGeneratesTheControllersOfEveryIndexedMount() {
    var app =
        Javac.compile(
            List.of(frameworkApSeeing(compileUiModule())),
            Map.of("com.acme.app.Application", APP_MODULE));

    assertThat(app.errors()).isEmpty();
    assertThat(app.generatedClassNames())
        .containsExactlyInAnyOrder(
            "com.acme.ui.HomeController",
            "com.acme.ui.HomeMateuController",
            "com.acme.ui.HomeConfig",
            "com.acme.ui.HomeUIRouteResolver",
            "com.acme.ui.SecureController",
            "com.acme.ui.SecureMateuController",
            "com.acme.ui.SecureConfig",
            "com.acme.ui.SecureUIRouteResolver");
  }

  /** What the UI module declared on its class survives the trip through the index. */
  @Test
  public void theHeadTagsOfAnIndexedMountReachItsIndexPage() {
    var app =
        Javac.compile(
            List.of(frameworkApSeeing(compileUiModule())),
            Map.of("com.acme.app.Application", APP_MODULE));

    assertThat(app.generatedSource("com.acme.ui.HomeController"))
        .contains("<meta name=\\\"theme-color\\\" content=\\\"#0a0a0a\\\">")
        .contains("<link rel=\\\"icon\\\" href=\\\"/favicon.svg\\\" type=\\\"image/svg+xml\\\">")
        .contains("<script src=\\\"/push.js\\\" defer></script>");
    // the root mount answers the bare root and the initial _empty load
    assertThat(
            app.generatedSource("com.acme.ui.HomeUIRouteResolver")
                .split("new CompiledRouteValue\\(\"\", \"_empty\"", -1))
        .hasSize(3);
  }

  @Test
  public void anIndexedMountKeepsItsBundlePath() {
    var app =
        Javac.compile(
            List.of(frameworkApSeeing(compileUiModule())),
            Map.of("com.acme.app.Application", APP_MODULE));

    assertThat(app.generatedSource("com.acme.ui.SecureController"))
        .contains("/secure/bundle/mateu.js")
        .doesNotContain("keycloak-js");
    assertThat(app.generatedSource("com.acme.ui.SecureMateuController"))
        .contains("@RequestMapping(\"/secure/mateu\")");
  }

  /**
   * When the module being compiled has {@code @UI} sources, {@link MateuUIAnnotationProcessor}
   * already reads the index; the companion must stand down, or every indexed controller would be
   * generated twice — javac's "Attempt to recreate a file" error.
   */
  @Test
  public void withUiSourcesBothProcessorsTogetherGenerateEachIndexedMountOnce() {
    var app =
        Javac.compile(
            List.of(new MateuUIAnnotationProcessor(), new MateuIndexedUIProcessor()),
            Map.of(
                "com.acme.app.Admin",
                "package com.acme.app; @io.mateu.uidl.annotations.UI(\"/admin\") public class Admin {}"));

    assertThat(app.errors()).isEmpty();
    // com.example.IndexedApp is indexed in this module's test resources
    assertThat(app.generatedClassNames())
        .contains("com.acme.app.AdminController", "com.example.IndexedAppController");
  }

  /** Without UI sources the companion alone serves the index (the plain AP never runs then). */
  @Test
  public void withoutUiSourcesTheCompanionAloneGeneratesTheIndexedMounts() {
    var app =
        Javac.compile(
            List.of(new MateuIndexedUIProcessor()), Map.of("com.acme.app.Application", APP_MODULE));

    assertThat(app.errors()).isEmpty();
    assertThat(app.generatedClassNames())
        .contains("com.example.IndexedAppController", "com.example.IndexedAppUIRouteResolver");
  }

  /**
   * The indexed controllers must be generated BEFORE the last round: a file created in the round
   * where {@code processingOver()} is true is never handed to another processor, so Micronaut's
   * bean-definition processor never saw them and a Micronaut app whose UI lives only in a UI module
   * answered 404 on every mount.
   */
  @Test
  public void theIndexedControllersReachTheOtherProcessorsInALaterRound() {
    var seen = new RoundRecorder();
    var app =
        Javac.compile(
            List.of(frameworkApSeeing(compileUiModule()), seen),
            Map.of("com.acme.app.Application", APP_MODULE));

    assertThat(app.errors()).isEmpty();
    assertThat(seen.rootsSeenBeforeTheLastRound)
        .contains(
            "com.acme.ui.HomeController",
            "com.acme.ui.HomeMateuController",
            "com.acme.ui.HomeConfig",
            "com.acme.ui.SecureMateuController");
    assertThat(app.diagnostics().toString()).doesNotContain("last round");
  }

  /** Stands for any framework AP that has to see the generated sources (Micronaut's). */
  @SupportedAnnotationTypes("*")
  @SupportedSourceVersion(SourceVersion.RELEASE_8)
  static class RoundRecorder extends AbstractProcessor {
    final Set<String> rootsSeenBeforeTheLastRound = new HashSet<>();

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
      if (!roundEnv.processingOver()) {
        for (Element e : roundEnv.getRootElements()) {
          if (e instanceof TypeElement t) {
            rootsSeenBeforeTheLastRound.add(t.getQualifiedName().toString());
          }
        }
      }
      return false;
    }
  }

  /** An {@code @App} without a route still makes the plain AP read the index: once, not twice. */
  @Test
  public void aValuelessAppSourceGeneratesEachIndexedMountOnce() {
    assertGeneratedOnce(
        "com.acme.app.Chrome",
        "package com.acme.app; @io.mateu.uidl.annotations.App public class Chrome {}");
  }

  /** Same with a routed {@code @UI} source: the plain AP claims it and runs alone in round one. */
  @Test
  public void aUiSourceGeneratesEachIndexedMountOnce() {
    assertGeneratedOnce(
        "com.acme.app.Admin",
        "package com.acme.app; @io.mateu.uidl.annotations.UI(\"/admin\") public class Admin {}");
  }

  private static void assertGeneratedOnce(String className, String source) {
    // the generator prints a FilerException instead of reporting it: watch stderr
    var err = new java.io.ByteArrayOutputStream();
    var previous = System.err;
    System.setErr(new java.io.PrintStream(err, true));
    Javac.Result app;
    try {
      app =
          Javac.compile(
              List.of(new MateuUIAnnotationProcessor(), new MateuIndexedUIProcessor()),
              Map.of(className, source));
    } finally {
      System.setErr(previous);
    }

    assertThat(app.errors()).isEmpty();
    assertThat(err.toString()).doesNotContain("recreate");
    assertThat(app.generatedClassNames()).contains("com.example.IndexedAppController");
  }

  /** A mount compiled in this module is not generated a second time from a stale index entry. */
  @Test
  public void aMountCompiledHereIsNotRegeneratedFromTheIndex() {
    var app =
        Javac.compile(
            List.of(new MateuUIAnnotationProcessor()),
            Map.of(
                "com.example.IndexedApp",
                "package com.example; @io.mateu.uidl.annotations.UI(\"/indexed\") public class"
                    + " IndexedApp {}"));

    assertThat(app.errors()).isEmpty();
    assertThat(app.generatedClassNames()).contains("com.example.IndexedAppController");
  }
}
