package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.jupiter.api.Test;

/**
 * Scanning {@code specs/ui} inside a JAR must not close the {@link java.util.jar.JarFile} the JVM
 * caches for that jar: every {@code jar:} URL read of the same file shares it (a classloader
 * reading a class or a resource, another request scanning). Closing it from the scan made a reader
 * in flight fail with "zip file closed" — seen on Quarkus under concurrent load.
 */
class SpecsIndexJarScanTest {

  private static Path jarWithSpecs() throws Exception {
    var jar = Files.createTempFile("mateu-specs", ".jar");
    try (var out = new JarOutputStream(Files.newOutputStream(jar))) {
      for (var dir : List.of("specs/", "specs/ui/", "specs/ui/nested/")) {
        out.putNextEntry(new JarEntry(dir));
        out.closeEntry();
      }
      for (var name : List.of("specs/ui/a.yaml", "specs/ui/nested/b.yml")) {
        out.putNextEntry(new JarEntry(name));
        out.write(
            ("type: Routes\n# " + "x".repeat(64 * 1024) + "\n").getBytes(StandardCharsets.UTF_8));
        out.closeEntry();
      }
    }
    jar.toFile().deleteOnExit();
    return jar;
  }

  @Test
  void aScanLeavesTheJvmCachedJarOpenForAReaderInFlight() throws Exception {
    var jar = jarWithSpecs();
    var resource = new URL("jar:" + jar.toUri() + "!/specs/ui/a.yaml");
    try (var cl = new URLClassLoader(new URL[] {jar.toUri().toURL()}, null);
        InputStream inFlight = resource.openStream()) {
      inFlight.read(new byte[16]);

      assertThat(SpecsIndex.scan(cl))
          .containsExactlyInAnyOrder("specs/ui/a.yaml", "specs/ui/nested/b.yml");

      // the reader that opened the cached JarFile before the scan still reads
      assertThat(inFlight.readAllBytes()).isNotEmpty();
    }
  }

  @Test
  void concurrentScansAndReadsOfTheSameJarDoNotFail() throws Exception {
    var jar = jarWithSpecs();
    var resource = new URL("jar:" + jar.toUri() + "!/specs/ui/nested/b.yml");
    ExecutorService pool = Executors.newFixedThreadPool(8);
    try (var cl = new URLClassLoader(new URL[] {jar.toUri().toURL()}, null)) {
      var start = new CountDownLatch(1);
      List<Future<?>> work = new ArrayList<>();
      for (int i = 0; i < 64; i++) {
        boolean scan = i % 2 == 0;
        work.add(
            pool.submit(
                () -> {
                  start.await();
                  if (scan) {
                    assertThat(SpecsIndex.scan(cl)).hasSize(2);
                  } else {
                    try (var in = resource.openStream()) {
                      assertThat(in.readAllBytes()).isNotEmpty();
                    }
                  }
                  return null;
                }));
      }
      start.countDown();
      for (var f : work) {
        f.get(30, TimeUnit.SECONDS);
      }
    } finally {
      pool.shutdownNow();
    }
  }
}
