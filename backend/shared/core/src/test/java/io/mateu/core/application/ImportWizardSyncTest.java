package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.importwizard.ImportWizard;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The guided CSV import wizard ({@code ImportWizard<Row>} archetype): upload/paste a CSV, auto-map
 * its columns onto the row class (adjustable in an inline-editable grid whose target-field cell is
 * a select fed by the form's {@code OptionsSupplier}), review a per-line validation report
 * (conversion failures + jakarta constraints), then import exactly the valid rows. Driven through
 * the same wire the browser uses (JSON round-trip, integerized whole doubles), like {@link
 * WizardCrossStepStateSyncTest}.
 */
class ImportWizardSyncTest {

  @SuppressWarnings("unused")
  public static class Product {
    @NotEmpty public String name;
    public int units;
    public boolean active;

    public Product() {}
  }

  static List<Product> imported;

  @UI("/product-import")
  public static class ProductImport extends ImportWizard<Product> {
    @Override
    protected void importRows(List<Product> rows, HttpRequest httpRequest) {
      imported = new ArrayList<>(rows);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProductImport.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    imported = null;
  }

  // 3 good rows + 1 missing name (@NotEmpty) + 1 uncoercible units
  static final String CSV =
      """
      Name,Units,Active
      Keyboard,10,true
      Mouse,25,false
      ,5,true
      Screen,abc,true
      Cable,3,false
      """;

  @Test
  void theWizardParsesMapsValidatesAndImportsOnlyTheValidRows() throws Exception {
    var first = mateu.sync("/product-import");
    var firstState = state(first);
    assertThat(firstState).containsEntry("position", 0);

    // step 1 → 2: paste the CSV and go next — the mapping auto-detects by name similarity
    var s1 = wire(firstState);
    s1.put("pasted", CSV);
    var second = run("next", s1);
    var secondState = state(second);
    assertThat(secondState).containsEntry("position", 1);
    var mappings = rows(secondState, "mappings");
    assertThat(mappings).hasSize(3);
    assertThat(mappings)
        .extracting(row -> row.get("csvColumn"))
        .containsExactly("Name", "Units", "Active");
    assertThat(mappings)
        .extracting(row -> row.get("targetField"))
        .containsExactly("name", "units", "active");
    // the sample column carries the first data row
    assertThat(mappings.get(0)).containsEntry("sample", "Keyboard");

    // step 2 → 3: the validation report counts 3 valid / 2 invalid and details the issues
    var third = run("next", wire(secondState));
    var thirdState = state(third);
    assertThat(thirdState).containsEntry("position", 2);
    assertThat(thirdState).containsEntry("validRows", 3);
    assertThat(thirdState).containsEntry("invalidRows", 2);
    var issues = rows(thirdState, "issues");
    assertThat(issues).hasSize(2);
    assertThat(issues)
        .extracting(issue -> issue.get("problem"))
        .anyMatch(problem -> String.valueOf(problem).contains("Must not be empty"))
        .anyMatch(problem -> String.valueOf(problem).contains("Cannot convert"));

    // completion: exactly the 3 valid rows reach importRows, typed; the result step shows counts
    var done = run("doImport", wire(thirdState));
    assertThat(imported).isNotNull();
    assertThat(imported).hasSize(3);
    assertThat(imported)
        .extracting(product -> product.name)
        .containsExactly("Keyboard", "Mouse", "Cable");
    assertThat(imported.get(0).units).isEqualTo(10);
    assertThat(imported.get(0).active).isTrue();
    var doneState = state(done);
    assertThat(doneState).containsEntry("position", 3);
    assertThat(doneState).containsEntry("imported", 3);
    assertThat(doneState).containsEntry("skipped", 2);
  }

  @Test
  void theTargetFieldCellIsAnInlineSelectFedByTheRowClassFieldNames() throws Exception {
    var first = mateu.sync("/product-import");
    var s1 = wire(state(first));
    s1.put("pasted", CSV);
    var second = run("next", s1);

    var column = findGridColumn(second.fragments().get(0).component(), "targetField");
    assertThat(column).isNotNull();
    assertThat(column.editable()).isTrue();
    assertThat(column.editorType()).isEqualTo("select");
    assertThat(column.editorOptions())
        .extracting(option -> option.value())
        .contains("name", "units", "active");

    // the read-only cells stay display-only
    var csvColumn = findGridColumn(second.fragments().get(0).component(), "csvColumn");
    assertThat(csvColumn).isNotNull();
    assertThat(csvColumn.editable()).isFalse();
  }

  @Test
  void editedMappingsAndSemicolonSeparatedUploadsAreHonoured() throws Exception {
    // headers that do NOT match the field names, semicolon-separated, as an uploaded data URI
    var csv = "Producto;Cantidad\nTeclado;4\nRaton;7\n";
    var dataUri =
        "data:text/csv;name=productos.csv;base64,"
            + java.util.Base64.getEncoder()
                .encodeToString(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    var first = mateu.sync("/product-import");
    var s1 = wire(state(first));
    s1.put("file", dataUri);
    var second = run("next", s1);
    var secondState = state(second);
    var mappings = rows(secondState, "mappings");
    assertThat(mappings).hasSize(2);
    // nothing auto-mapped — the user edits the target field cells in the grid
    assertThat(mappings).allSatisfy(row -> assertThat(row.get("targetField")).isEqualTo(""));
    mappings.get(0).put("targetField", "name");
    mappings.get(1).put("targetField", "units");

    var third = run("next", wire(secondState));
    var thirdState = state(third);
    assertThat(thirdState).containsEntry("validRows", 2);
    assertThat(thirdState).containsEntry("invalidRows", 0);

    run("doImport", wire(thirdState));
    assertThat(imported).extracting(product -> product.name).containsExactly("Teclado", "Raton");
    assertThat(imported).extracting(product -> product.units).containsExactly(4, 7);
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/product-import")
            .actionId(actionId)
            .serverSideType(ProductImport.class.getName())
            .componentState(state)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>) increment.fragments().get(0).state();
  }

  @SuppressWarnings("unchecked")
  private static List<Map<String, Object>> rows(Map<String, Object> state, String key) {
    assertThat(state.get(key)).isInstanceOf(List.class);
    return (List<Map<String, Object>>) state.get(key);
  }

  /** Finds a grid column dto by id via the shared metadata-descending walker. */
  private static io.mateu.dtos.GridColumnDto findGridColumn(Object component, String columnId) {
    var columns = new ArrayList<io.mateu.dtos.GridColumnDto>();
    FieldKindsSyncTest.walk(component, io.mateu.dtos.GridColumnDto.class, columns);
    return columns.stream().filter(column -> columnId.equals(column.id())).findFirst().orElse(null);
  }

  /** JSON round-trip + JS-style integerization of whole doubles: what the browser echoes back. */
  @SuppressWarnings("unchecked")
  static Map<String, Object> wire(Map<String, Object> state) throws Exception {
    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
    mapper.configure(
        com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    var json = mapper.writeValueAsString(state);
    var parsed = mapper.readValue(json, Map.class);
    return (Map<String, Object>) jsify(parsed);
  }

  static Object jsify(Object value) {
    if (value instanceof Double d && d == Math.floor(d) && !Double.isInfinite(d)) {
      long l = (long) (double) d;
      return (l >= Integer.MIN_VALUE && l <= Integer.MAX_VALUE) ? (Object) (int) l : (Object) l;
    }
    if (value instanceof Map<?, ?> map) {
      var out = new LinkedHashMap<String, Object>();
      map.forEach((k, v) -> out.put(String.valueOf(k), jsify(v)));
      return out;
    }
    if (value instanceof List<?> list) {
      return list.stream().map(ImportWizardSyncTest::jsify).toList();
    }
    return value;
  }
}
