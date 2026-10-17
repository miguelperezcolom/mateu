package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import java.io.File;
import java.math.BigInteger;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Field types {@code FieldTypeMapper} maps but the rest of the pipeline used to treat as nested
 * forms (BigInteger, java.util.Date, java.sql.Date, ZonedDateTime, File) or dropped (Status) or
 * failed to serialise: each one made the WHOLE page fail.
 */
class MoreFieldTypesSyncTest {

  @SuppressWarnings("unused")
  @UI("/more-field-types")
  public static class MoreTypesForm {
    BigInteger big = new BigInteger("12345678901234567890");
    Date when = new Date(0);
    java.sql.Date sqlWhen = java.sql.Date.valueOf("2026-10-17");
    ZonedDateTime zoned = ZonedDateTime.parse("2026-10-17T10:15:30+02:00");
    File file;
    Status status = new Status(StatusType.SUCCESS, "All good");
    String name = "Ada";

    public String echo() {
      return big
          + "|"
          + name
          + "|"
          + zoned.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime()
          + "|"
          + java.time.LocalDateTime.ofInstant(when.toInstant(), java.time.ZoneId.systemDefault())
          + "|"
          + sqlWhen;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(MoreTypesForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static ServerSideComponentDto root(UIIncrementDto increment) {
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  static Map<String, FormFieldDto> fields(UIIncrementDto increment) {
    var result = new LinkedHashMap<String, FormFieldDto>();
    FieldKindsSyncTest.collect(root(increment), FormFieldDto.class)
        .forEach(f -> result.put(f.fieldId(), f));
    return result;
  }

  @Test
  void everyMappedTypeRendersAsAFieldNotANestedForm() {
    var increment = mateu.sync("/more-field-types");
    var fields = fields(increment);
    System.out.println(
        "FIELDS " + fields.keySet() + " STATE " + increment.fragments().get(0).state());
    assertThat(fields.get("big").dataType()).isEqualTo("integer");
    assertThat(fields.get("when").dataType()).isEqualTo("dateTime");
    assertThat(fields.get("sqlWhen").dataType()).isEqualTo("dateTime");
    assertThat(fields.get("zoned").dataType()).isEqualTo("dateTime");
    assertThat(fields.get("file").dataType()).isEqualTo("file");
    // a Status is the page's status chip, not a form field
    assertThat(fields).doesNotContainKey("status");
    var page = FieldKindsSyncTest.collect(root(increment), io.mateu.dtos.PageDto.class).get(0);
    assertThat(page.badges())
        .anySatisfy(b -> assertThat(b.text()).isEqualTo("${state.status.message}"));
    assertThat(fields.get("name").dataType()).isEqualTo("string");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state.get("big")).hasToString("12345678901234567890");
    assertThat(state).containsKey("status");
    // the date-times travel as the local ISO date-time the pickers read
    assertThat((String) state.get("sqlWhen")).isEqualTo("2026-10-17T00:00:00");
    assertThat((String) state.get("zoned")).doesNotContain("+").contains("T");
  }

  @Test
  void theirValuesRoundTripThroughAnAction() {
    var load = mateu.sync("/more-field-types");
    @SuppressWarnings("unchecked")
    var state = new LinkedHashMap<>((Map<String, Object>) load.fragments().get(0).state());
    state.put("big", "98765432109876543210");
    state.put("name", "Grace");
    state.put("zoned", "2026-01-02T03:04:05");
    state.put("when", "2026-01-02T03:04:05");
    state.put("sqlWhen", "2026-01-02T00:00:00");
    var response =
        mateu.run(
            RunActionRqDto.builder()
                .route("/more-field-types")
                .consumedRoute("_empty")
                .actionId("echo")
                .serverSideType(MoreTypesForm.class.getName())
                .componentState(state)
                .build());
    assertThat(response.toString())
        .contains("98765432109876543210|Grace|2026-01-02T03:04:05|2026-01-02T03:04:05|2026-01-02");
  }
}
