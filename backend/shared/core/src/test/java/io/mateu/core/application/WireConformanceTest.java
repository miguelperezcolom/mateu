package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java half of the shared wire conformance corpus (see {@code conformance/README.md}).
 *
 * <p>Java is the reference: this test GENERATES the goldens (with {@code -Dconformance.write=true})
 * and then verifies against them like any other server. The point is not that Java passes — it
 * will, it wrote them — but that the expectation now lives in a file the other two servers read,
 * instead of inside three separate test suites that only their own authors run.
 */
class WireConformanceTest {

  // ── The fixtures. Each must be mirrored, with the same semantics, by every server. ───────────

  /** Field kinds, a section, and the labels/dataTypes they imply. */
  @SuppressWarnings("unused")
  @UI("/conformance/simple-form")
  @Title("Simple form")
  @Subtitle("Every basic field kind")
  public static class SimpleForm {
    @Section("Identity")
    public String name = "Ada";

    public int age = 36;
    public boolean active = true;
    public LocalDate birthDate = LocalDate.of(1815, 12, 10);
    public Colour colour = Colour.green;

    public enum Colour {
      red,
      green,
      blue
    }
  }

  /** The canonical page header: the elements a renderer hoists out of the body. */
  @SuppressWarnings("unused")
  @UI("/conformance/page-header")
  @Title("Requisition 4471")
  @Subtitle("Pending approval")
  @Overline("Requisitions")
  public static class PageHeader {
    @KPI public String amount = "1,240 €";

    @Timestamp("Last updated")
    public String updatedAt = "2026-07-20 12:00";

    public String notes = "";
  }

  private static final List<String> CASES = List.of("simple-form", "page-header");

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SimpleForm.class, PageHeader.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── The corpus ───────────────────────────────────────────────────────────────────────────────

  /**
   * The wire mapper, configured as the adapters configure theirs — dates as ISO strings rather than
   * numeric tuples, which is what actually travels and what the other servers emit.
   */
  private static final ObjectMapper MAPPER =
      new ObjectMapper()
          .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
          .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

  static Path corpus() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../conformance/cases")
        .normalize();
  }

  /**
   * Values that legitimately differ between servers or between runs. Comparing them would make the
   * corpus report noise, and a check that reports noise gets ignored — so they are dropped on both
   * sides rather than argued about.
   */
  private static final Set<String> VOLATILE = Set.of("id", "structureHash", "generatedAt");

  /** Drops volatile members and empty ones, and sorts keys, so two servers can be compared. */
  static JsonNode normalise(JsonNode node) {
    if (node.isObject()) {
      var out = MAPPER.createObjectNode();
      var names = new java.util.TreeSet<String>();
      node.fieldNames().forEachRemaining(names::add);
      for (var name : names) {
        if (VOLATILE.contains(name)) {
          continue;
        }
        var value = normalise(node.get(name));
        if (isDefault(value)) {
          continue; // absent and default mean the same thing to a renderer
        }
        out.set(name, value);
      }
      return out;
    }
    if (node.isArray()) {
      ArrayNode out = MAPPER.createArrayNode();
      node.forEach(child -> out.add(normalise(child)));
      return out;
    }
    return node;
  }

  /**
   * Whether a value carries no information. Servers legitimately differ on whether they SEND a
   * member at its default or omit it — Java emits {@code false}/{@code 0}/{@code ""}, the ports
   * omit them — and a renderer cannot tell the two apart. Comparing them would make the corpus
   * report dozens of differences that mean nothing, and a corpus that reports noise gets ignored.
   */
  private static boolean isDefault(JsonNode value) {
    return value.isNull()
        || (value.isArray() && value.isEmpty())
        || (value.isObject() && value.isEmpty())
        || (value.isBoolean() && !value.asBoolean())
        || (value.isNumber() && value.asDouble() == 0d)
        || (value.isTextual() && value.asText().isEmpty());
  }

  private static JsonNode actual(String route) {
    var increment = mateu.sync("/conformance/" + route);
    return normalise(MAPPER.valueToTree(increment));
  }

  @Test
  void everyCaseMatchesTheCorpus() throws IOException {
    var write = Boolean.getBoolean("conformance.write");
    for (var name : CASES) {
      var actual = actual(name);
      var file = corpus().resolve(name).resolve("expected.json");
      if (write) {
        Files.createDirectories(file.getParent());
        Files.writeString(
            file, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(actual) + "\n");
        continue;
      }
      assertThat(Files.exists(file))
          .as("golden for '%s' (generate it with -Dconformance.write=true)", name)
          .isTrue();
      assertThat(actual)
          .as("case '%s' — the reference no longer produces what the corpus pins", name)
          .isEqualTo(MAPPER.readTree(Files.readString(file)));
    }
  }

  @Test
  void normalisationDropsWhatServersMayLegitimatelyDisagreeOn() throws IOException {
    var raw =
        MAPPER.readTree(
            "{\"id\":\"generated-7\",\"type\":\"Page\",\"badges\":[],\"subtitle\":null,\"title\":\"X\"}");
    assertThat(normalise(raw).toString()).isEqualTo("{\"title\":\"X\",\"type\":\"Page\"}");
  }

  @Test
  void normalisationIsStableRegardlessOfKeyOrder() throws IOException {
    var one = MAPPER.readTree("{\"b\":1,\"a\":2}");
    var other = MAPPER.readTree("{\"a\":2,\"b\":1}");
    assertThat(normalise(one)).isEqualTo(normalise(other));
  }
}
