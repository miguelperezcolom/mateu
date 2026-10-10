package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.core.application.runaction.FieldTypeResolver;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FieldTypeEntry;
import io.mateu.uidl.interfaces.FieldTypeCatalogSupplier;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

/**
 * The field type catalogue ({@code specs/ui/types.yaml} + {@link FieldTypeCatalogSupplier} beans):
 * a {@code FormField} / {@code GridColumn} naming a type by {@code fieldType:} takes the type's
 * attributes as DEFAULTS, its own explicit attributes win, an unknown type WARNs and renders as
 * declared, and authored types win over code-supplied ones. Fixture: {@code field-types/specs/ui}.
 */
class FieldTypesSyncTest {

  /** A code producer: one type the authored file overrides, one only code declares. */
  public static class CodeTypes implements FieldTypeCatalogSupplier {
    @Override
    public List<FieldTypeEntry> fieldTypes() {
      return List.of(
          FieldTypeEntry.of("Money", FieldDataType.number, FieldStereotype.regular),
          FieldTypeEntry.of("Phone", FieldDataType.string, FieldStereotype.regular).toBuilder()
              .placeholder("+34 600 000 000")
              .build());
    }
  }

  static final java.nio.file.Path FIXTURES =
      java.nio.file.Path.of(
          "../../../frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__");

  /**
   * A fresh load of {@code route}, as wire JSON — and, with {@code -Dexpander.golden.write=true},
   * written as the golden the browser expander's {@code fieldTypes.test.ts} is pinned to (the same
   * YAML expanded client-side must be a structural subset of it).
   */
  private static JsonNode load(String route) {
    var wire =
        SpecsFixture.over(
            "field-types",
            () -> {
              try (var mateu = TestMateu.withUisAndBeans(List.of(new CodeTypes()))) {
                return SpecsFixture.wire(
                    mateu.run(
                        RunActionRqDto.builder()
                            .route(route)
                            .consumedRoute("_empty")
                            .actionId("")
                            .build()));
              }
            });
    if (Boolean.getBoolean("expander.golden.write")) {
      try {
        java.nio.file.Files.writeString(
            FIXTURES.resolve(route.replace("/", "") + ".golden.json"),
            SpecsFixture.JSON.writerWithDefaultPrettyPrinter().writeValueAsString(wire) + "\n");
      } catch (java.io.IOException e) {
        throw new java.io.UncheckedIOException(e);
      }
    }
    return wire;
  }

  /**
   * The wire object for the form field (fieldId) or grid column (id + dataType) named {@code id}.
   */
  private static JsonNode field(JsonNode wire, String id) {
    var found = new ArrayList<JsonNode>();
    collect(wire, id, found);
    assertThat(found).as("field '%s' on the wire", id).isNotEmpty();
    return found.get(0);
  }

  private static JsonNode column(JsonNode wire, String id) {
    var found = new ArrayList<JsonNode>();
    collectColumns(wire, id, found);
    assertThat(found).as("column '%s' on the wire", id).isNotEmpty();
    return found.get(0);
  }

  private static void collect(JsonNode node, String id, List<JsonNode> out) {
    if (node.isObject() && id.equals(node.path("fieldId").asText(null))) {
      out.add(node);
    }
    node.forEach(child -> collect(child, id, out));
  }

  private static void collectColumns(JsonNode node, String id, List<JsonNode> out) {
    if (node.isObject()
        && "GridColumn".equals(node.path("type").asText())
        && id.equals(node.path("id").asText(null))) {
      out.add(node);
    }
    node.forEach(child -> collectColumns(child, id, out));
  }

  @Test
  void aFormFieldTakesItsTypesAttributesAsDefaults() {
    var email = field(load("/ft-customer"), "email");
    assertThat(email.path("stereotype").asText()).isEqualTo("email");
    assertThat(email.path("label").asText()).isEqualTo("E-mail");
    assertThat(email.path("placeholder").asText()).isEqualTo("name@example.com");
    assertThat(email.path("required").asBoolean()).isTrue();
    assertThat(email.has("fieldType")).as("the wire never carries the reference").isFalse();
  }

  @Test
  void whatTheFieldDeclaresItselfWins() {
    var backup = field(load("/ft-customer"), "backup");
    assertThat(backup.path("label").asText()).isEqualTo("Backup e-mail");
    assertThat(backup.path("required").asBoolean()).isFalse();
    // …and what it does not declare still comes from the type
    assertThat(backup.path("stereotype").asText()).isEqualTo("email");
  }

  @Test
  void aCodeSuppliedTypeResolvesAndTheAuthoredFileWinsOverIt() {
    var phone = field(load("/ft-customer"), "phone");
    assertThat(phone.path("placeholder").asText()).isEqualTo("+34 600 000 000");
    // Money is declared in code as `number` and in types.yaml as `money`: authored wins
    var total = column(load("/ft-orders"), "total");
    assertThat(total.path("dataType").asText()).isEqualTo("money");
  }

  @Test
  void aListingColumnTakesItsTypeIncludingTheBadgeTones() {
    var wire = load("/ft-orders");
    var status = column(wire, "status");
    assertThat(status.path("dataType").asText()).isEqualTo("status");
    assertThat(status.path("label").asText()).isEqualTo("Status");
    assertThat(status.path("tones").path("OPEN").asText()).isEqualTo("warning");
    assertThat(status.path("tones").path("SHIPPED").asText()).isEqualTo("success");
    var total = column(wire, "total");
    assertThat(total.path("label").asText()).as("the column's own label wins").isEqualTo("Amount");
    assertThat(total.path("align").asText()).isEqualTo("end");
    // a filter naming the same type gets its options
    var filter = field(wire, "status");
    assertThat(filter.path("options")).hasSize(2);
  }

  @Test
  void anUnknownTypeIsWarnedAboutAndTheFieldRendersAsDeclared() {
    var logger = (Logger) LoggerFactory.getLogger(FieldTypeResolver.class);
    var logs = new ListAppender<ILoggingEvent>();
    logs.start();
    logger.addAppender(logs);
    JsonNode wire;
    try {
      wire = load("/ft-unknown");
    } finally {
      logger.detachAppender(logs);
    }
    assertThat(wire.toString()).doesNotContain("Not found.");
    assertThat(field(wire, "nickname").path("label").asText()).isEqualTo("Nickname");
    assertThat(logs.list)
        .filteredOn(e -> e.getFormattedMessage().contains("'Nope'"))
        .singleElement()
        .satisfies(e -> assertThat(e.getLevel().toString()).isEqualTo("WARN"));
  }
}
