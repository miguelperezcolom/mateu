package io.mateu.maven.bundle;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.uidl.data.ProjectRenderer;
import java.io.FileOutputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/**
 * The bundle ships the PROJECT's renderer: its static app is found in the renderer jar on the app
 * classpath (not only in a directory), and a Redwood bundle carries the whole Visual Builder app.
 */
public class BundleWriterTest {

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  private static final String INDEX =
      "<html><head><title>AQUIELTITULODELAPAGINA</title></head><body><!-- AQUIUI --><!--"
          + " HASTAAQUIUI --></body></html>";

  private Path jar(String name, Map<String, String> entries) throws Exception {
    var file = tmp.getRoot().toPath().resolve(name);
    try (var out = new JarOutputStream(new FileOutputStream(file.toFile()))) {
      for (var e : entries.entrySet()) {
        out.putNextEntry(new JarEntry(e.getKey()));
        out.write(e.getValue().getBytes(StandardCharsets.UTF_8));
        out.closeEntry();
      }
    }
    return file;
  }

  private Path dir(String name, Map<String, String> files) throws Exception {
    var root = tmp.newFolder(name).toPath();
    for (var e : files.entrySet()) {
      var f = root.resolve(e.getKey());
      Files.createDirectories(f.getParent());
      Files.writeString(f, e.getValue());
    }
    return root;
  }

  private ClassLoader loader(Path... roots) throws Exception {
    var urls = new URL[roots.length];
    for (int i = 0; i < roots.length; i++) {
      urls[i] = roots[i].toUri().toURL();
    }
    return new URLClassLoader(urls, null);
  }

  private Path vaadinJar() throws Exception {
    return jar(
        "vaadin-lit.jar",
        Map.of("static/_index.html", INDEX, "static/assets/index.js", "/* vaadin */"));
  }

  private Path redwoodJar() throws Exception {
    return jar(
        "redwood.jar",
        Map.of(
            "static/_index.html",
            INDEX,
            "static/_redwood/app-flow.json",
            "{}",
            "static/_redwood/resources/js/mateu-bridge.js",
            "/* bridge */"));
  }

  private static MateuBundleExporter.BundleManifest manifest() {
    return new MateuBundleExporter.BundleManifest("", "now", true, List.of());
  }

  @Test
  public void aRedwoodBundleCopiesTheVisualBuilderAppOutOfTheJar() throws Exception {
    var out = tmp.newFolder("out").toPath();
    BundleWriter.write(
        out,
        manifest(),
        null,
        loader(vaadinJar(), redwoodJar()),
        "",
        "Shop",
        ProjectRenderer.redwood);
    assertTrue(Files.isRegularFile(out.resolve("_redwood/app-flow.json")));
    assertTrue(Files.isRegularFile(out.resolve("_redwood/resources/js/mateu-bridge.js")));
    assertFalse("never the other renderer's files", Files.exists(out.resolve("assets")));
    var index = Files.readString(out.resolve("index.html"));
    assertTrue(index.contains("bundleUrl=\"/manifest.json\""));
    assertTrue(index.contains("<title>Shop</title>"));
    assertTrue(Files.isRegularFile(out.resolve("manifest.json")));
  }

  @Test
  public void aVaadinBundleTakesTheVaadinJarEvenWhenRedwoodIsAlsoThere() throws Exception {
    var out = tmp.newFolder("out").toPath();
    BundleWriter.write(
        out,
        manifest(),
        null,
        loader(redwoodJar(), vaadinJar()),
        "",
        "Shop",
        ProjectRenderer.vaadin);
    assertTrue(Files.isRegularFile(out.resolve("assets/index.js")));
    assertFalse(Files.exists(out.resolve("_redwood")));
  }

  @Test
  public void aMissingRendererJarFailsNamingTheArtifact() throws Exception {
    var out = tmp.newFolder("out").toPath();
    try {
      BundleWriter.write(
          out, manifest(), null, loader(vaadinJar()), "", "Shop", ProjectRenderer.redwood);
      throw new AssertionError("expected a failure");
    } catch (java.io.IOException e) {
      assertTrue(e.getMessage(), e.getMessage().contains("io.mateu:mateu-redwood"));
    }
  }

  @Test
  public void aStaticDirectoryOnTheClasspathStillWorks() throws Exception {
    var classes = dir("classes", Map.of("static/_index.html", INDEX, "static/assets/a.js", ""));
    var out = tmp.newFolder("out").toPath();
    BundleWriter.write(out, manifest(), null, loader(classes), "", "T");
    assertTrue(Files.isRegularFile(out.resolve("assets/a.js")));
    assertTrue(Files.isRegularFile(out.resolve("index.html")));
  }

  @Test
  public void theRendererIsTheProjectsUnlessNamed() throws Exception {
    var project =
        dir("project", Map.of("specs/ui/project.yaml", "type: Project\nrenderer: redwood\n"));
    var cl = loader(project, vaadinJar());
    assertEquals(ProjectRenderer.redwood, BundleMojo.chooseRenderer(null, cl));
    assertEquals(ProjectRenderer.vaadin, BundleMojo.chooseRenderer("vaadin", cl));
    // no descriptor: whatever the classpath serves
    assertEquals(ProjectRenderer.redwood, BundleMojo.chooseRenderer(null, loader(redwoodJar())));
    assertEquals(ProjectRenderer.vaadin, BundleMojo.chooseRenderer(null, loader(vaadinJar())));
  }
}
