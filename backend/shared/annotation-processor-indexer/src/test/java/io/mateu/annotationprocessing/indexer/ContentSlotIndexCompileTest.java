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
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;
import org.junit.Test;

/** {@code @ContentSlot} keys are checked at compile time and every slot lands in the descriptor. */
public class ContentSlotIndexCompileTest {

  private record Compiled(String descriptor, List<String> errors) {}

  private static Compiled compile(Map<String, String> sources) throws Exception {
    Path classes = Files.createTempDirectory("mateu-slots");
    var javac = ToolProvider.getSystemJavaCompiler();
    var diagnostics = new DiagnosticCollector<JavaFileObject>();
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
      task.setProcessors(List.of(new ContentSlotProcessor()));
      task.call();
    }
    var descriptor = classes.resolve(ContentSlotIndex.RESOURCE);
    return new Compiled(
        Files.exists(descriptor) ? Files.readString(descriptor) : null,
        diagnostics.getDiagnostics().stream()
            .filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
            .map(d -> d.getMessage(Locale.ROOT))
            .toList());
  }

  @Test
  public void everySlotOfTheModuleIsInTheDescriptor() throws Exception {
    var compiled =
        compile(
            Map.of(
                "com.acme.Home",
                """
                package com.acme;
                import io.mateu.uidl.annotations.*;
                @UI("/home")
                public class Home {
                  @ContentSlot(key = "front-office.home.destacado", fallback = "Sin \\"novedades\\"",
                      description = "Banner de la home", timeoutMs = 100)
                  String destacado;
                }
                """,
                "com.acme.Checkin",
                """
                package com.acme;
                import io.mateu.uidl.annotations.*;
                public class Checkin {
                  @ContentSlot(key = "front-office.checkin.wizard.ayuda-documentacion")
                  String ayuda;
                }
                """));
    assertThat(compiled.errors()).isEmpty();
    assertThat(compiled.descriptor())
        .contains("\"version\": 1")
        .contains(
            "{\"key\": \"front-office.home.destacado\", \"application\": \"front-office\","
                + " \"screen\": \"home\", \"name\": \"destacado\", \"declaredIn\": \"com.acme.Home\","
                + " \"field\": \"destacado\", \"route\": \"/home\", \"fallback\": \"Sin"
                + " \\\"novedades\\\"\", \"description\": \"Banner de la home\", \"timeoutMs\": 100,"
                + " \"degradeToClient\": false}")
        .contains(
            "\"key\": \"front-office.checkin.wizard.ayuda-documentacion\", \"application\":"
                + " \"front-office\", \"screen\": \"checkin.wizard\", \"name\":"
                + " \"ayuda-documentacion\"");
  }

  @Test
  public void aMalformedKeyIsACompileError() throws Exception {
    for (var key : List.of("home.destacado", "Front.home.x", "a..b.c", "a.b.c_d", "a.b.c-")) {
      var compiled =
          compile(
              Map.of(
                  "com.acme.Bad",
                  "package com.acme; public class Bad {"
                      + " @io.mateu.uidl.annotations.ContentSlot(key = \""
                      + key
                      + "\") String slot; }"));
      assertThat(compiled.errors()).as(key).singleElement().asString().contains("'" + key + "'");
    }
  }

  @Test
  public void aRepeatedKeyIsACompileError() throws Exception {
    var compiled =
        compile(
            Map.of(
                "com.acme.A",
                "package com.acme; public class A {"
                    + " @io.mateu.uidl.annotations.ContentSlot(key = \"app.a.x\") String x; }",
                "com.acme.B",
                "package com.acme; public class B {"
                    + " @io.mateu.uidl.annotations.ContentSlot(key = \"app.a.x\") String y; }"));
    assertThat(compiled.errors()).singleElement().asString().contains("already used by");
  }
}
