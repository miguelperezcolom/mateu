package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.FieldDataType;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

/**
 * A listing column keeps the number-ness of its field, so renderers right-align and group it; it
 * used to travel as "string" (UX review W-V-NUMBERS). Form grid columns keep the coarse type.
 */
class ListingColumnDataTypeTest {

  @SuppressWarnings("unused")
  static class Row {
    int quantity;
    Long id;
    double salary;
    BigDecimal amount;
    String name;
    boolean active;
    java.time.LocalDate added;
    java.time.LocalDateTime updated;
    java.time.OffsetDateTime stamped;
    java.time.LocalTime opens;
  }

  private static FieldDataType listing(String field) throws Exception {
    return ColumnTypeMapper.getDataTypeForListingColumn(Row.class.getDeclaredField(field));
  }

  @Test
  void numbersKeepANumericDataType() throws Exception {
    assertThat(listing("quantity")).isEqualTo(FieldDataType.integer);
    assertThat(listing("id")).isEqualTo(FieldDataType.integer);
    assertThat(listing("salary")).isEqualTo(FieldDataType.number);
    assertThat(listing("amount")).isEqualTo(FieldDataType.number);
  }

  @Test
  void datesAndTimesSaySo() throws Exception {
    // the renderers write them in the UI's locale; as "string" they showed the ISO value
    assertThat(listing("added")).isEqualTo(FieldDataType.date);
    assertThat(listing("updated")).isEqualTo(FieldDataType.dateTime);
    assertThat(listing("stamped")).isEqualTo(FieldDataType.dateTime);
    assertThat(listing("opens")).isEqualTo(FieldDataType.time);
    assertThat(ColumnTypeMapper.getDataTypeForColumn(Row.class.getDeclaredField("added")))
        .isEqualTo(FieldDataType.string);
  }

  @Test
  void everythingElseIsUnchanged() throws Exception {
    assertThat(listing("name")).isEqualTo(FieldDataType.string);
    assertThat(listing("active")).isEqualTo(FieldDataType.bool);
    // form grid columns keep the coarse type (conformance case grid-field)
    assertThat(ColumnTypeMapper.getDataTypeForColumn(Row.class.getDeclaredField("salary")))
        .isEqualTo(FieldDataType.string);
  }
}
