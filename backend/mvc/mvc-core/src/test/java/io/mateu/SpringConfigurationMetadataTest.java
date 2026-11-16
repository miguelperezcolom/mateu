package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * The {@code mateu.*} settings documented to Spring Boot users (IDE completion and descriptions in
 * {@code application.properties}) are settings Mateu really reads: every name listed in {@code
 * META-INF/additional-spring-configuration-metadata.json} appears as a string literal in the main
 * sources of core or of this adapter. A renamed or removed setting fails here instead of being
 * offered, silently doing nothing, to every user.
 */
class SpringConfigurationMetadataTest {

  private static final Path BACKEND = Path.of("../..").toAbsolutePath().normalize();
  private static final List<Path> SOURCES =
      List.of(
          BACKEND.resolve("shared/core/src/main/java"),
          BACKEND.resolve("mvc/mvc-core/src/main/java"));

  private final ObjectMapper json = new ObjectMapper();

  @Test
  void everyDocumentedSettingIsReadSomewhere() throws IOException {
    var sources = allSources();
    List<String> unread = new ArrayList<>();
    for (String name : documentedNames(authored())) {
      if (!sources.contains("\"" + name + "\"")) {
        unread.add(name);
      }
    }
    assertThat(unread).as("documented mateu.* settings no main source reads").isEmpty();
  }

  @Test
  void everyEntryIsAMateuSettingWithATypeAndADescription() throws IOException {
    for (JsonNode property : authored().path("properties")) {
      var name = property.path("name").asText();
      assertThat(name).startsWith("mateu.");
      assertThat(property.path("type").asText()).as(name + " type").isNotBlank();
      assertThat(property.path("description").asText()).as(name + " description").isNotBlank();
    }
    var names = documentedNames(authored());
    assertThat(names).doesNotHaveDuplicates().isNotEmpty();
  }

  /** The configuration processor merged the authored file into the jar's metadata. */
  @Test
  void theJarCarriesTheMergedMetadata() throws IOException {
    try (InputStream merged =
        getClass().getResourceAsStream("/META-INF/spring-configuration-metadata.json")) {
      assertThat(merged).as("META-INF/spring-configuration-metadata.json").isNotNull();
      assertThat(documentedNames(json.readTree(merged))).containsAll(documentedNames(authored()));
    }
  }

  private JsonNode authored() throws IOException {
    try (InputStream in =
        getClass().getResourceAsStream("/META-INF/additional-spring-configuration-metadata.json")) {
      assertThat(in).isNotNull();
      return json.readTree(in);
    }
  }

  private static List<String> documentedNames(JsonNode metadata) {
    List<String> names = new ArrayList<>();
    metadata.path("properties").forEach(p -> names.add(p.path("name").asText()));
    return names;
  }

  private static String allSources() throws IOException {
    var all = new StringBuilder();
    for (Path root : SOURCES) {
      try (Stream<Path> walk = Files.walk(root)) {
        for (Path file : walk.filter(p -> p.toString().endsWith(".java")).toList()) {
          all.append(Files.readString(file)).append('\n');
        }
      }
    }
    return all.toString();
  }
}
