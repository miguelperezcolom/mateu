package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The editor of a {@code List<Row>} field's row carries every kind of field the row declares, so a
 * renderer can draw them all in its row dialog: a multi-select whose options come from the ROW's
 * {@link OptionsSupplier} (inline, as the field's options), and a nested {@code List<Child>} as a
 * grid field with one column per child field. Redwood's row dialog used to drop both (the
 * renderer's gap, not the wire's) — this pins the wire it now reads.
 */
class RowEditorFieldKindsSyncTest {

  public enum Kind {
    HTML,
    LINKS
  }

  @SuppressWarnings("unused")
  public static class Link {
    public String label;
    public String url;
  }

  @SuppressWarnings("unused")
  public static class Block implements OptionsSupplier {
    public Kind type = Kind.HTML;
    public String title;
    public Integer limit;
    public boolean pinned;
    public LocalDate from;

    @Stereotype(FieldStereotype.select)
    public String sectionId;

    public List<Link> links = new ArrayList<>();

    @Stereotype(FieldStereotype.multiSelect)
    public List<String> departments;

    @Override
    public boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
      return "departments".equals(fieldName) || "sectionId".equals(fieldName);
    }

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
      return "departments".equals(fieldName)
          ? List.of(new Option("SALES", "Sales"), new Option("OPS", "Operations"))
          : List.of(new Option("news", "News"), new Option("events", "Events"));
    }
  }

  @SuppressWarnings("unused")
  @UI("/page")
  public static class PageForm {
    String name = "Home";
    List<Block> blocks = new ArrayList<>();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PageForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Map<String, Object> baseState() {
    var link = new HashMap<String, Object>();
    link.put("label", "Intranet");
    link.put("url", "https://intranet.example");
    var row = new HashMap<String, Object>();
    row.put("type", "LINKS");
    row.put("title", "Shortcuts");
    row.put("links", List.of(link));
    row.put("departments", List.of("OPS"));
    row.put("pinned", false);
    row.put("_rowNumber", 0);
    var state = new HashMap<String, Object>();
    state.put("name", "Home");
    state.put("blocks", List.of(row));
    return state;
  }

  private UIIncrementDto select() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/page")
            .actionId("blocks_select")
            .serverSideType(PageForm.class.getName())
            .componentState(baseState())
            .parameters(Map.of("_rowNumber", 0))
            .initiatorComponentId("form1_app")
            .build());
  }

  private static Map<String, FormFieldDto> fields(UIIncrementDto increment) {
    var editor =
        increment.fragments().stream()
            .map(fragment -> fragment.component())
            .filter(ServerSideComponentDto.class::isInstance)
            .map(ServerSideComponentDto.class::cast)
            .filter(component -> Block.class.getName().equals(component.serverSideType()))
            .findFirst()
            .orElseThrow();
    var out = new HashMap<String, FormFieldDto>();
    FieldKindsSyncTest.collect(editor, FormFieldDto.class).forEach(f -> out.put(f.fieldId(), f));
    return out;
  }

  @Test
  void aMultiSelectCarriesTheRowsSuppliedOptions() {
    var departments = fields(select()).get("departments");
    assertThat(departments.dataType()).isEqualTo("array");
    assertThat(departments.stereotype()).isEqualTo("multiSelect");
    assertThat(departments.options()).extracting("value").containsExactly("SALES", "OPS");
  }

  @Test
  void aNestedListIsAGridWithAColumnPerChildField() {
    var links = fields(select()).get("links");
    assertThat(links.dataType()).isEqualTo("array");
    assertThat(io.mateu.core.infra.JsonSerializer.toJson(links.columns()))
        .contains("\"label\"")
        .contains("\"url\"");
  }

  @Test
  void theSimpleKindsAreThere() {
    var fields = fields(select());
    assertThat(fields).containsKeys("type", "title", "limit", "pinned", "from", "sectionId");
    assertThat(fields.get("sectionId").options()).extracting("value").contains("news");
    // -Dmateu.rowedit.dump=<…>/apps/redwood/poc/fixtures/real/rowedit-block-kinds.json re-captures
    // the Redwood fixtures (the editor, and the page's load as <name>-load.json); the editor's
    // fragments then target the load's form id instead of "form1_app"
    var dump = System.getProperty("mateu.rowedit.dump");
    if (dump != null) {
      try {
        java.nio.file.Files.writeString(
            java.nio.file.Path.of(dump), io.mateu.core.infra.JsonSerializer.toJson(select()));
        java.nio.file.Files.writeString(
            java.nio.file.Path.of(dump.replace(".json", "-load.json")),
            io.mateu.core.infra.JsonSerializer.toJson(mateu.sync("/page")));
      } catch (java.io.IOException e) {
        throw new RuntimeException(e);
      }
    }
  }
}
