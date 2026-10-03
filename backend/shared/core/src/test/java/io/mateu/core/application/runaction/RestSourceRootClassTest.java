package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.uidl.annotations.RestSource;
import io.mateu.uidl.annotations.UI;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * {@code @RestSource} on the ROOT app ({@code @UI("")}) is read. The registry used to walk the
 * index by ROUTE, which leaves out a blank path — exactly the app shell, the natural home of an
 * app-wide catalogue — so a Java app's catalogue came out empty, live and in a bundle.
 */
class RestSourceRootClassTest {

  @UI("")
  @RestSource(name = "vcns", url = "https://api.example.com/vcns")
  public static class RootApp {}

  @Test
  void theRootClassContributesItsSources(@TempDir Path dir) throws Exception {
    var index = dir.resolve("META-INF/mateu/ui-registrations");
    Files.createDirectories(index.getParent());
    Files.writeString(index, "class=" + RootApp.class.getName() + "\npath=\n---\n");
    try (var cl =
        new URLClassLoader(
            new java.net.URL[] {dir.toUri().toURL()},
            RestSourceRootClassTest.class.getClassLoader())) {
      // the route view leaves the root out (it keys by route)…
      assertThat(RouteRegistrations.read(cl))
          .noneMatch(ref -> RootApp.class.getName().equals(ref.className()));
      // …the class view keeps it
      assertThat(RouteRegistrations.classes(cl)).contains(RootApp.class.getName());
      assertThat(new RestSourceRegistry().derivedFrom(cl).get("vcns")).isPresent();
    }
  }
}
