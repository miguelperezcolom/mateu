package io.mateu.core.build;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Every published jar of the backend is listed in {@code io.mateu:mateu-bom} — so an application
 * that imports the BOM never has to give a Mateu artifact a version of its own. A module added
 * without its BOM entry fails here instead of being discovered by a user.
 */
class MateuBomCompletenessTest {

  private static final Path BACKEND = Path.of("../..").toAbsolutePath().normalize();

  @Test
  void everyPublishedJarIsInTheBom() throws IOException {
    String bom = Files.readString(BACKEND.resolve("mateu-bom/pom.xml"));
    List<String> missing = new ArrayList<>();
    for (Path pom : publishedJarPoms()) {
      String artifactId = artifactIdOf(Files.readString(pom));
      if (!bom.contains("<artifactId>" + artifactId + "</artifactId>")) {
        missing.add(artifactId + " (" + BACKEND.relativize(pom) + ")");
      }
    }
    assertThat(missing).as("artifacts missing from mateu-bom").isEmpty();
  }

  @Test
  void everyPublishedJarCarriesTheMateuPrefix() throws IOException {
    List<String> offenders = new ArrayList<>();
    for (Path pom : publishedJarPoms()) {
      String artifactId = artifactIdOf(Files.readString(pom));
      if (!artifactId.startsWith("mateu-")) {
        offenders.add(artifactId + " (" + BACKEND.relativize(pom) + ")");
      }
    }
    assertThat(offenders).as("published artifacts without the mateu- prefix").isEmpty();
  }

  /**
   * Every pre-rename id keeps resolving: its relocation pom points at an artifact the BOM lists,
   * and no current module took the old id back.
   */
  @Test
  void everyRelocationPointsAtAPublishedArtifact() throws IOException {
    String bom = Files.readString(BACKEND.resolve("mateu-bom/pom.xml"));
    List<String> current = new ArrayList<>();
    for (Path pom : publishedJarPoms()) {
      current.add(artifactIdOf(Files.readString(pom)));
    }
    List<String> broken = new ArrayList<>();
    int relocations = 0;
    try (Stream<Path> dirs = Files.list(BACKEND.resolve("relocations"))) {
      for (Path dir : dirs.filter(d -> Files.isRegularFile(d.resolve("pom.xml"))).toList()) {
        String pom = Files.readString(dir.resolve("pom.xml"));
        String oldId = artifactIdOf(pom);
        var target =
            Pattern.compile("(?s)<relocation>.*?<artifactId>(.*?)</artifactId>").matcher(pom);
        relocations++;
        if (!target.find()) {
          broken.add(oldId + ": no relocation");
        } else if (!bom.contains("<artifactId>" + target.group(1) + "</artifactId>")) {
          broken.add(oldId + " -> " + target.group(1) + ": not in the BOM");
        }
        if (current.contains(oldId)) {
          broken.add(oldId + ": is a current module id again");
        }
      }
    }
    assertThat(relocations).as("relocation poms found").isPositive();
    assertThat(broken).isEmpty();
  }

  private static List<Path> publishedJarPoms() throws IOException {
    List<Path> poms = new ArrayList<>();
    try (Stream<Path> walk = Files.walk(BACKEND)) {
      for (Path pom :
          walk.filter(p -> p.getFileName().toString().equals("pom.xml"))
              .filter(
                  p -> {
                    String s = p.toString();
                    return !s.contains("/target/")
                        && !s.contains("/node_modules/")
                        && !s.contains("/src/")
                        && !s.contains("/relocations/")
                        && !s.contains("/dotnet/")
                        && !s.contains("/python/");
                  })
              .toList()) {
        String content = Files.readString(pom);
        String header = content.replaceAll("(?s)<parent>.*?</parent>", "");
        boolean aggregator = header.contains("<packaging>pom</packaging>");
        // A Maven plugin or an archetype is never a dependency, so it has no place in a BOM.
        boolean plugin =
            header.contains("<packaging>maven-plugin</packaging>")
                || header.contains("<packaging>maven-archetype</packaging>");
        boolean internal = content.contains("<maven.deploy.skip>true</maven.deploy.skip>");
        if (!aggregator && !plugin && !internal) {
          poms.add(pom);
        }
      }
    }
    assertThat(poms).as("the backend's module poms are found from the core module").isNotEmpty();
    return poms;
  }

  private static String artifactIdOf(String pom) {
    var header = pom.replaceAll("(?s)<parent>.*?</parent>", "");
    var matcher = Pattern.compile("<artifactId>(.*?)</artifactId>").matcher(header);
    return matcher.find() ? matcher.group(1) : "?";
  }
}
