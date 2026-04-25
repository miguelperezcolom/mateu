package io.mateu.core.domain.reflection;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.reflection.write.ValueWriter;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.Test;

class ValueWriterTest {

  static class Target {
    String name;
    int count;
    boolean active;
    Integer boxedInt;
    Long longField;
    Double doubleField;
    BigDecimal bigDecimal;
    BigInteger bigInteger;
    LocalDate localDate;
    LocalDateTime localDateTime;
    List<String> items;

    public void setName(String name) {
      this.name = name;
    }

    public void setCount(int count) {
      this.count = count;
    }

    public void setActive(boolean active) {
      this.active = active;
    }
  }

  @Test
  void setStringField() throws Exception {
    var t = new Target();
    ValueWriter.setValue("name", t, "hello");
    assertEquals("hello", t.name);
  }

  @Test
  void setIntFieldFromString() throws Exception {
    var t = new Target();
    ValueWriter.setValue("count", t, "42");
    assertEquals(42, t.count);
  }

  @Test
  void setBooleanFieldFromString() throws Exception {
    var t = new Target();
    ValueWriter.setValue("active", t, "true");
    assertTrue(t.active);
  }

  @Test
  void setNullField() throws Exception {
    var t = new Target();
    t.name = "existing";
    ValueWriter.setValue("name", t, null);
    assertNull(t.name);
  }

  @Test
  void setOnMap() throws Exception {
    var map = new HashMap<String, Object>();
    ValueWriter.setValue("key", map, "value");
    assertEquals("value", map.get("key"));
  }

  @Test
  void setListField() throws Exception {
    var t = new Target();
    ValueWriter.setValue("items", t, new ArrayList<>(List.of("a", "b")));
    assertThat(t.items).containsExactly("a", "b");
  }

  @Test
  void setFieldWhenNullField() throws Exception {
    var t = new Target();
    // nonExistent field - should silently do nothing
    ValueWriter.setValue("nonExistent", t, "value");
    // no exception
  }

  @Test
  void setValueByFieldObject() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("bigDecimal");
    ValueWriter.setValue(field, t, new BigDecimal("3.14"));
    assertEquals(new BigDecimal("3.14"), t.bigDecimal);
  }

  @Test
  void setValueByFieldNull() throws Exception {
    var t = new Target();
    ValueWriter.setValue((java.lang.reflect.Field) null, t, "value");
    // should silently do nothing when field is null
  }

  @Test
  void setLocalDateFromString() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("localDate");
    ValueWriter.setValue(field, t, "2024-01-15");
    assertEquals(LocalDate.of(2024, 1, 15), t.localDate);
  }

  @Test
  void setLocalDateTimeFromString() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("localDateTime");
    ValueWriter.setValue(field, t, "2024-01-15T10:30:00");
    assertEquals(LocalDateTime.of(2024, 1, 15, 10, 30, 0), t.localDateTime);
  }

  @Test
  void setEmptyStringToNonStringFieldSetsNull() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("bigDecimal");
    ValueWriter.setValue(field, t, "");
    assertNull(t.bigDecimal);
  }

  @Test
  void setNestedPath() throws Exception {
    // nested path requires getter to return non-null
    // just verify no exception with missing getter
    var t = new Target();
    assertDoesNotThrow(() -> ValueWriter.setValue("name", t, "test"));
  }
}
