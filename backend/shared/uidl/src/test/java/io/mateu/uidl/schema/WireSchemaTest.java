package io.mateu.uidl.schema;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.dtos.ComponentMetadataDto;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * {@code wire-schema.json} pins the FIELDS of the wire, which nothing else did: the discriminator
 * test pins type names, the conformance corpus pins the non-default members of a few dozen cases,
 * and japicmp on {@code mateu-dtos} is report-only by design (a new optional field replaces a
 * record's canonical constructor — fine for JSON, binary-incompatible for Java).
 *
 * <p>The wire is additive within a major, so the two directions are treated differently:
 *
 * <ul>
 *   <li><b>an addition</b> (a new type, a new field, a new enum constant) fails until the schema is
 *       regenerated — a reviewed, one-command act;
 *   <li><b>a removal, rename or type change</b> of anything the checked-in schema lists fails EVEN
 *       WHEN REGENERATING: it is a breaking change to every renderer, and needs a wire major. Only
 *       {@code -Dwire.schema.break=true} (a major bump, reviewed as such) lets it through.
 * </ul>
 *
 * <p>To regenerate after adding a wire field or type:
 *
 * <pre>mvn -pl shared/uidl test -Dtest=WireSchemaTest -Dwire.schema.write=true</pre>
 */
class WireSchemaTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** The checked-in schema, next to the authoring schemas at the root of the uidl module. */
  private static Path schemaFile() {
    return Path.of(System.getProperty("user.dir")).resolve("wire-schema.json");
  }

  @Test
  void theCheckedInWireSchemaMatchesTheDtosAndNothingWasRemoved() throws IOException {
    var generated = WireSchemaGenerator.generate();
    var file = schemaFile();
    var committed = Files.exists(file) ? MAPPER.readTree(Files.readString(file)) : null;
    var breaking = committed == null ? List.<String>of() : breakingChanges(committed, generated);

    if (Boolean.getBoolean("wire.schema.write")) {
      assertThat(breaking)
          .as(
              "regenerating would REMOVE or CHANGE wire members a renderer may read — that is a"
                  + " breaking change (a wire major). Pass -Dwire.schema.break=true only for a"
                  + " major bump")
          .matches(b -> b.isEmpty() || Boolean.getBoolean("wire.schema.break"));
      UidlSchemaGenerator.write(file, generated);
      return;
    }

    assertThat(committed).as("wire-schema.json is missing — generate it (see javadoc)").isNotNull();
    assertThat(breaking)
        .as(
            "wire members were removed, renamed or retyped — every renderer may read them; the"
                + " wire is additive within a major")
        .isEmpty();
    assertThat(committed)
        .as(
            "wire-schema.json is stale (a wire member or type was ADDED) — regenerate it:"
                + " mvn -pl shared/uidl test -Dtest=WireSchemaTest -Dwire.schema.write=true")
        .isEqualTo(generated);
  }

  @Test
  void aRemovedOrRenamedFieldIsReportedAsBreaking() {
    var generated = WireSchemaGenerator.generate();
    var withoutAField = generated.deepCopy();
    var formField = (ObjectNode) withoutAField.get("$defs").get("FormFieldDto").get("properties");
    formField.set("labelText", formField.remove("label")); // a rename

    // the "committed" schema has `label`; the code now emits `labelText`
    assertThat(breakingChanges(generated, withoutAField))
        .containsExactly("removed field FormFieldDto.label");
    // a pure addition (a schema that lacks `label` → one that has it) is not breaking
    var older = generated.deepCopy();
    ((ObjectNode) older.get("$defs").get("FormFieldDto").get("properties")).remove("label");
    assertThat(breakingChanges(older, generated)).isEmpty();
  }

  @Test
  void aRetypedFieldARemovedTypeAndARemovedConstantAreBreaking() {
    var generated = WireSchemaGenerator.generate();
    var changed = generated.deepCopy();
    var defs = (ObjectNode) changed.get("$defs");
    ((ObjectNode) defs.get("MessageDto").get("properties"))
        .putObject("duration")
        .put("type", "string");
    defs.remove("ChipDto");
    var variants =
        (com.fasterxml.jackson.databind.node.ArrayNode) defs.get("BannerThemeDto").get("enum");
    variants.remove(0);

    assertThat(breakingChanges(generated, changed))
        .contains("changed field MessageDto.duration", "removed type ChipDto")
        .anyMatch(s -> s.startsWith("removed constant BannerThemeDto."));
  }

  @Test
  void theSchemaCoversEveryComponentTypeAndHonoursJacksonAnnotations() {
    var defs = WireSchemaGenerator.generate().get("$defs");
    var registered = ComponentMetadataDto.class.getAnnotation(JsonSubTypes.class).value().length;
    assertThat(defs.get("ComponentMetadataDto").get("oneOf")).hasSize(registered);
    // every subtype carries its discriminator
    assertThat(defs.get("FormFieldDto").get("properties").get("type").get("const").asText())
        .isEqualTo("FormField");
    // @JsonIgnore'd members do not travel, so they are not in the schema
    assertThat(defs.get("MenuOptionDto").get("properties").has("order")).isFalse();
    // the envelope and the request are both described
    assertThat(defs.get("UIIncrementDto").get("properties").has("wireVersion")).isTrue();
    assertThat(defs.get("RunActionRqDto").get("properties").has("componentState")).isTrue();
  }

  /** What {@code before} lists and {@code after} no longer has (or has with another schema). */
  static List<String> breakingChanges(JsonNode before, JsonNode after) {
    var out = new ArrayList<String>();
    var beforeDefs = before.path("$defs");
    var afterDefs = after.path("$defs");
    beforeDefs
        .fieldNames()
        .forEachRemaining(
            name -> {
              var was = beforeDefs.get(name);
              var now = afterDefs.get(name);
              if (now == null) {
                out.add("removed type " + name);
                return;
              }
              if (was.has("enum")) {
                var constants = new HashSet<String>();
                now.path("enum").forEach(c -> constants.add(c.asText()));
                was.get("enum")
                    .forEach(
                        c -> {
                          if (!constants.contains(c.asText())) {
                            out.add("removed constant " + name + "." + c.asText());
                          }
                        });
              }
              if (was.has("oneOf")) {
                Set<String> refs = new HashSet<>();
                now.path("oneOf").forEach(r -> refs.add(r.path("$ref").asText()));
                was.get("oneOf")
                    .forEach(
                        r -> {
                          if (!refs.contains(r.path("$ref").asText())) {
                            out.add("removed subtype " + name + " <- " + r.path("$ref").asText());
                          }
                        });
              }
              var wasProps = was.path("properties");
              var nowProps = now.path("properties");
              wasProps
                  .fieldNames()
                  .forEachRemaining(
                      p -> {
                        if (!nowProps.has(p)) {
                          out.add("removed field " + name + "." + p);
                        } else if (!wasProps.get(p).equals(nowProps.get(p))) {
                          out.add("changed field " + name + "." + p);
                        }
                      });
            });
    return out;
  }
}
