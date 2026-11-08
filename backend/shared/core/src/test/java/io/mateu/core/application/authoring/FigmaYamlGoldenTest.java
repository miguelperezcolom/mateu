package io.mateu.core.application.authoring;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.uidl.data.CollectionDetailPage;
import io.mateu.uidl.data.DataManagementPage;
import io.mateu.uidl.data.GuidedProcessPage;
import io.mateu.uidl.data.ItemOverviewPage;
import io.mateu.uidl.data.WelcomePage;
import io.mateu.uidl.fluent.Form;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;

/**
 * What the Figma → YAML converter (design/figma/to-yaml) writes is a specs/ui file Mateu reads.
 *
 * <p>The converter's golden output — the Star Wars screens of its fixture, pinned byte for byte by
 * the converter's own tests — goes here through the two readers a real file meets: the authoring
 * validator (the generated specs schema, as {@code mateu_validate_uidl} runs it) and the YAML
 * loader that serves the page. A mapping in the contract that named a key the schema does not have,
 * or a template the loader cannot build, fails here rather than in a designer's app.
 */
class FigmaYamlGoldenTest {

  private static final ObjectMapper OM = new ObjectMapper();
  private static final UidlValidator VALIDATOR =
      new UidlValidator(AuthoringResources.specsSchema(OM), OM);
  private static final YamlUidlLoader LOADER = new YamlUidlLoader();

  private static Path tests() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../design/figma/to-yaml/test")
        .normalize();
  }

  private static Path golden() {
    return tests().resolve("golden");
  }

  /**
   * The Star Wars screens ({@code golden}), a screen made with the current library's native slots
   * and component properties ({@code golden-native}), and the screens really composed in Figma with
   * the published kit ({@code design/figma/e2e/golden}).
   */
  private static List<Path> files() throws Exception {
    var out = new ArrayList<Path>();
    for (var dir : List.of("golden", "golden-native", "../../e2e/golden")) {
      try (Stream<Path> walk = Files.walk(tests().resolve(dir))) {
        walk.filter(p -> p.toString().endsWith(".yaml")).sorted().forEach(out::add);
      }
    }
    return out;
  }

  @TestFactory
  Stream<DynamicTest> everyGeneratedFileIsValidAndLoads() throws Exception {
    var files = files();
    assertThat(files).as("the converter's golden files").hasSizeGreaterThanOrEqualTo(9);
    return files.stream()
        .map(
            file ->
                DynamicTest.dynamicTest(
                    tests().relativize(file).toString(),
                    () -> {
                      var yaml = Files.readString(file);
                      JsonNode report = VALIDATOR.validate(yaml, null);
                      assertThat(report.get("errors")).as(report.toPrettyString()).isEmpty();
                      assertThat(issueCodes(report.get("warnings")))
                          .as(report.toPrettyString())
                          .doesNotContain(
                              "unknown_property",
                              "unknown_type",
                              "invalid_value",
                              "wrong_type",
                              "missing_required",
                              "missing_type");
                      var parsed = LOADER.parseTextReporting(yaml);
                      assertThat(parsed.problem()).isNull();
                      assertThat(parsed.component()).isNotNull();
                    }));
  }

  @Test
  void theTemplatedPagesLoadAsTheirTemplates() throws Exception {
    assertThat(templateOf("welcome.yaml")).isInstanceOf(WelcomePage.class);
    assertThat(templateOf("person.yaml")).isInstanceOf(ItemOverviewPage.class);
    assertThat(templateOf("species.yaml")).isInstanceOf(CollectionDetailPage.class);
    assertThat(templateOf("fleet.yaml")).isInstanceOf(DataManagementPage.class);
    var process = (GuidedProcessPage) templateOf("starship-new.yaml");
    assertThat(process.steps()).extracting("id").containsExactly("identity", "specifications");
    var person = (ItemOverviewPage) templateOf("person.yaml");
    assertThat(person.avatar().src()).isEqualTo("${state.image}");
    assertThat(person.body()).hasSize(3);
    var order = (ItemOverviewPage) templateOf("../golden-native/order.yaml");
    assertThat(order.avatar().initials()).isEqualTo("${state.initials}");
    assertThat(order.body()).hasSize(1);
  }

  private static Object templateOf(String name) throws Exception {
    var component = LOADER.parseText(Files.readString(golden().resolve(name)));
    assertThat(component).isInstanceOf(Form.class);
    return ((Form) component).template();
  }

  /**
   * The issue codes, minus the validator's note on {@code $schema}: the line every demo carries for
   * editor IntelliSense, which the loader ignores and the validator reports as an unknown key.
   */
  private static List<String> issueCodes(JsonNode issues) {
    var out = new ArrayList<String>();
    issues.forEach(
        i -> {
          if (!i.path("message").asText().contains("\"$schema\"")) out.add(i.get("code").asText());
        });
    return out;
  }
}
