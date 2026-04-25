package io.mateu.core.domain.reflection;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.reflection.write.ValueWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ValueWriterTest {

  // Use a public top-level-like approach: a public static class with public fields
  // ValueWriter falls back to direct field access when no setter found
  public static class Target {
    public String name;
    public int count;
    public boolean active;
    public BigDecimal bigDecimal;
    public LocalDate localDate;
    public LocalDateTime localDateTime;
    public List<String> items;
  }

  @Test
  void setStringFieldDirectly() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("name");
    ValueWriter.setValue(field, t, "hello");
    assertEquals("hello", t.name);
  }

  @Test
  void setStringFieldByName() throws Exception {
    var t = new Target();
    // setValue by name uses getFieldByName which finds public field
    // then falls back to field.set() since no setter exists
    ValueWriter.setValue("name", t, "world");
    assertEquals("world", t.name);
  }

  @Test
  void setNullFieldByField() throws Exception {
    var t = new Target();
    t.name = "existing";
    var field = Target.class.getDeclaredField("name");
    ValueWriter.setValue(field, t, null);
    assertNull(t.name);
  }

  @Test
  void setIntFieldByField() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("count");
    ValueWriter.setValue(field, t, "42");
    assertEquals(42, t.count);
  }

  @Test
  void setBooleanFieldByField() throws Exception {
    var t = new Target();
    var field = Target.class.getDeclaredField("active");
    ValueWriter.setValue(field, t, "true");
    assertTrue(t.active);
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
    var field = Target.class.getDeclaredField("items");
    ValueWriter.setValue(field, t, new ArrayList<>(List.of("a", "b")));
    assertThat(t.items).containsExactly("a", "b");
  }

  @Test
  void setNullFieldObject() throws Exception {
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
  void setValueDoesNothingForUnknownField() throws Exception {
    var t = new Target();
    // should not throw even if field not found
    assertDoesNotThrow(() -> ValueWriter.setValue("nonExistent", t, "value"));
  }
}
