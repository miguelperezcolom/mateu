package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Drift guard: every component the generated authoring schema advertises as authorable MUST be
 * registered in {@link YamlUidlMapperFactory}, or a YAML page that uses it fails to deserialise
 * even though the schema (and the editor IntelliSense pointed at it) says it is valid.
 *
 * <p>The two are separate lists — {@code UidlSchemaGenerator} derives the schema from the records,
 * while the Jackson subtype registration is hand-maintained — and they had drifted badly: 48 of the
 * 116 authorable components (Listing, Separator, every archetype layout, Gantt, Kanban…) were
 * absent, so nearly half the catalogue was unusable from YAML. Building the first data-only demo
 * surfaced it. This test parses the schema's {@code Component} union and asserts the factory mapper
 * can resolve each type id, so any future component added to the schema but not registered here
 * fails CI.
 */
class YamlComponentRegistrationTest {

  @Test
  void everyAuthorableComponentInTheSchemaIsRegisteredForYamlDeserialisation() throws Exception {
    var mapper = YamlUidlMapperFactory.create();
    var schema = new ObjectMapper().readTree(Files.readString(schemaPath()));

    var componentTypes = componentTypeNames(schema);
    // Sanity: the schema really did expose the full catalogue (not an empty/partial read).
    assertThat(componentTypes).hasSizeGreaterThan(100).contains("Listing", "Separator", "Text");

    var unresolved = new ArrayList<String>();
    for (var type : componentTypes) {
      try {
        // Resolving the type id is what we assert; a record that then fails to construct from an
        // empty body (a missing required field) has still RESOLVED, which is all this guards.
        mapper.readValue("type: \"" + type + "\"\n", io.mateu.uidl.fluent.Component.class);
      } catch (InvalidTypeIdException e) {
        unresolved.add(type);
      } catch (Exception constructionButResolved) {
        // type id resolved fine — ignore construction failures for this guard.
      }
    }

    assertThat(unresolved)
        .as("authorable components missing from YamlUidlMapperFactory.registerSubtypes")
        .isEmpty();
  }

  /** The type names of every entry in the schema's {@code Component} oneOf union. */
  private static List<String> componentTypeNames(JsonNode schema) {
    var defs = schema.has("$defs") ? schema.get("$defs") : schema.get("definitions");
    var names = new ArrayList<String>();
    for (var ref : defs.get("Component").get("oneOf")) {
      var defName = ref.get("$ref").asText().substring("#/$defs/".length());
      var type = defs.get(defName).path("properties").path("type");
      var value = type.has("const") ? type.get("const") : type.path("enum").path(0);
      if (value != null && value.isTextual()) {
        names.add(value.asText());
      }
    }
    return names;
  }

  /** The generated schema lives at the uidl module root; tests run from the core module dir. */
  private static Path schemaPath() {
    for (var candidate :
        List.of(
            Path.of("..", "uidl", "uidl-schema.json"),
            Path.of("shared", "uidl", "uidl-schema.json"),
            Path.of("backend", "shared", "uidl", "uidl-schema.json"))) {
      if (Files.exists(candidate)) {
        return candidate;
      }
    }
    throw new IllegalStateException(
        "uidl-schema.json not found from " + Path.of(".").toAbsolutePath());
  }
}
