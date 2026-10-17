package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.uidl.fluent.Component;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Every component tree the docs show as a whole specs/ui file must PARSE with the mapper the loader
 * uses. An unparseable definition does not report itself to the user — the page just answers "Not
 * found." — so a doc example that does not parse is a trap: copy it, and the screen silently
 * disappears. The schema (validated by the VS Code extension's specsSchema.test.ts) says what an
 * editor accepts; this says what the SERVER accepts, and the two must agree with the docs.
 */
class DocumentedYamlExamplesTest {

  private static final Pattern YAML_BLOCK = Pattern.compile("```ya?ml[^\\n]*\\n(.*?)```", 32);
  private static final Pattern FILE_HEADER =
      Pattern.compile("(?m)^(?=# (?:src/main/resources/)?specs/ui/)");

  /** File kinds that are not component trees: they have loaders of their own. */
  private static final Set<String> NOT_COMPONENTS =
      Set.of(
          "UI",
          "Routes",
          "Sources",
          "Actions",
          "Translations",
          "Environment",
          "Types",
          "Project",
          "Components");

  private static Path docs() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../doc/src/content/docs")
        .normalize();
  }

  @Test
  void everyDocumentedComponentTreeParses() throws IOException {
    var mapper = YamlUidlMapperFactory.create();
    var failures = new ArrayList<String>();
    var checked = 0;
    List<Path> files;
    try (Stream<Path> walk = Files.walk(docs())) {
      files = walk.filter(p -> p.toString().matches(".*\\.mdx?$")).sorted().toList();
    }
    for (var file : files) {
      var matcher = YAML_BLOCK.matcher(Files.readString(file));
      var block = 0;
      while (matcher.find()) {
        block++;
        for (var part : FILE_HEADER.split(matcher.group(1))) {
          if (part.isBlank() || part.contains("[...]") || part.contains("…")) {
            continue; // elided: content the example leaves out on purpose
          }
          JsonNode doc;
          try {
            doc = mapper.readTree(part);
          } catch (Exception e) {
            continue; // a fragment, not a file
          }
          for (var tree : treesOf(doc)) {
            checked++;
            try {
              mapper.treeToValue(tree, Component.class);
            } catch (Exception e) {
              failures.add(
                  docs().relativize(file)
                      + " block #"
                      + block
                      + ": "
                      + e.getMessage().lines().findFirst().orElse(""));
            }
          }
        }
      }
    }
    assertThat(checked).as("documented component trees found").isGreaterThan(40);
    assertThat(failures).as("documented YAML the server cannot parse").isEmpty();
  }

  /** The component trees a whole-file example carries, by file kind. */
  private static List<JsonNode> treesOf(JsonNode doc) {
    if (doc == null || !doc.isObject()) {
      return List.of();
    }
    var type = doc.path("type").asText("");
    if (doc.has("layout") && doc.get("layout").isObject()) {
      return List.of(doc.get("layout"));
    }
    if (doc.has("components") && doc.get("components").isArray() && type.isEmpty()) {
      var trees = new ArrayList<JsonNode>();
      doc.get("components").forEach(e -> trees.add(e.path("component")));
      return trees.stream().filter(JsonNode::isObject).toList();
    }
    if (doc.has("content") && type.isEmpty() && doc.get("content").isArray()) {
      var trees = new ArrayList<JsonNode>();
      doc.get("content").forEach(trees::add);
      return trees;
    }
    if (!type.isEmpty() && !NOT_COMPONENTS.contains(type)) {
      return List.of(doc);
    }
    return List.of();
  }
}
