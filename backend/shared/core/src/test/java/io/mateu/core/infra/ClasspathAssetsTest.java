package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ClasspathAssetsTest {

  @TempDir Path dir;

  private URLClassLoader jarWith(String... entries) throws IOException {
    Path jar = dir.resolve("renderer.jar");
    try (var out = new JarOutputStream(Files.newOutputStream(jar))) {
      for (String name : entries) {
        var entry = new JarEntry(name);
        entry.setTime(1_700_000_000_000L);
        out.putNextEntry(entry);
        if (!name.endsWith("/")) {
          out.write(("/* " + name + " */").getBytes(StandardCharsets.UTF_8));
        }
        out.closeEntry();
      }
    }
    return new URLClassLoader(new URL[] {jar.toUri().toURL()}, null);
  }

  @Test
  void findsTheRendererAssetsUnderStaticInAJar() throws Exception {
    try (var cl =
        jarWith(
            "static/",
            "static/assets/",
            "static/assets/mateu-vaadin.js",
            "static/js/keycloak.min.js",
            "static/_redwood/app.js")) {
      var asset = ClasspathAssets.find(cl, "/assets/mateu-vaadin.js");
      assertThat(asset).isNotNull();
      assertThat(new String(asset.read(), StandardCharsets.UTF_8))
          .isEqualTo("/* static/assets/mateu-vaadin.js */");
      assertThat(asset.contentLength()).isEqualTo(asset.read().length);
      assertThat(asset.etag()).startsWith("W/\"");
      assertThat(asset.contentType()).isEqualTo("text/javascript;charset=UTF-8");
      assertThat(asset.lastModifiedHeader()).endsWith("GMT");
      assertThat(ClasspathAssets.find(cl, "/js/keycloak.min.js")).isNotNull();
      assertThat(ClasspathAssets.find(cl, "/_redwood/app.js")).isNotNull();
    }
  }

  @Test
  void findsAssetsInAFolderOnTheClasspath() throws Exception {
    Files.createDirectories(dir.resolve("static/assets"));
    Files.writeString(dir.resolve("static/assets/fixed.js"), "x");
    try (var cl = new URLClassLoader(new URL[] {dir.toUri().toURL()}, null)) {
      var asset = ClasspathAssets.find(cl, "/assets/fixed.js");
      assertThat(asset).isNotNull();
      assertThat(asset.contentLength()).isEqualTo(1);
      assertThat(ClasspathAssets.find(cl, "/assets")).isNull();
      assertThat(ClasspathAssets.find(cl, "/assets/")).isNull();
    }
  }

  @Test
  void looksUpOnlyMateusOwnPathsAndNeverLeavesTheFolder() throws Exception {
    try (var cl = jarWith("static/assets/", "static/assets/a.js", "static/secret.txt", "x.txt")) {
      assertThat(ClasspathAssets.find(cl, "/secret.txt")).isNull();
      assertThat(ClasspathAssets.find(cl, "/assets/../secret.txt")).isNull();
      assertThat(ClasspathAssets.find(cl, "/assets/../../x.txt")).isNull();
      assertThat(ClasspathAssets.find(cl, "/assets//a.js")).isNull();
      assertThat(ClasspathAssets.find(cl, "/assets/")).isNull();
      assertThat(ClasspathAssets.find(cl, "/assets/missing.js")).isNull();
      assertThat(ClasspathAssets.find(cl, "assets/a.js")).isNull();
      assertThat(ClasspathAssets.find(null, "/assets/a.js")).isNull();
    }
  }

  @Test
  void typesByExtension() {
    assertThat(new ClasspathAssets.Asset("/assets/i.css", null, 1, 1).contentType())
        .isEqualTo("text/css;charset=UTF-8");
    assertThat(new ClasspathAssets.Asset("/assets/i.SVG", null, 1, 1).contentType())
        .isEqualTo("image/svg+xml;charset=UTF-8");
    assertThat(new ClasspathAssets.Asset("/assets/f.woff2", null, 1, 1).contentType())
        .isEqualTo("font/woff2");
    assertThat(new ClasspathAssets.Asset("/assets/noext", null, 1, 1).contentType()).isNull();
  }

  @Test
  void revalidatesByEtagFirstThenByDate() throws Exception {
    try (var cl = jarWith("static/assets/a.js")) {
      var asset = ClasspathAssets.find(cl, "/assets/a.js");
      String etag = asset.etag();
      assertThat(asset.notModified(etag, null)).isTrue();
      assertThat(asset.notModified("\"other\", " + etag, null)).isTrue();
      assertThat(asset.notModified("*", null)).isTrue();
      assertThat(asset.notModified("\"other\"", asset.lastModifiedHeader())).isFalse();
      assertThat(asset.notModified(null, asset.lastModifiedHeader())).isTrue();
      assertThat(asset.notModified(null, "Mon, 01 Jan 2001 00:00:00 GMT")).isFalse();
      assertThat(asset.notModified(null, "not a date")).isFalse();
      assertThat(asset.notModified(null, null)).isFalse();
    }
  }
}
