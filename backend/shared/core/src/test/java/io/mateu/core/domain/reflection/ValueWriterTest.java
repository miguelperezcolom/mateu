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
import org.junit.jupiter.api.Test;

class ValueWriterTest {

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
  void setStringFieldByField() throws Exception {
    var t = new Target();
    ValueWriter.setValue(Target.class.getDeclaredField("name"), t, "hello");
    assertEquals("hello", t.name);
  }

  @Test
  void setNullFieldByField() throws Exception {
    var t = new Target();
    t.name = "existing";
    ValueWriter.setValue(Target.class.getDeclaredField("name"), t, null);
    assertNull(t.name);
  }

  @Test
  void setIntFieldByField() throws Exception {
    var t = new Target();
    ValueWriter.setValue(Target.class.getDeclaredField("count"), t, "42");
    assertEquals(42, t.count);
  }

  @Test
  void setBooleanFieldByField() throws Exception {
    var t = new Target();
    ValueWriter.setValue(Target.class.getDeclaredField("active"), t, "true");
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
    ValueWriter.setValue(
        Target.class.getDeclaredField("items"), t, new ArrayList<>(List.of("a", "b")));
    assertThat(t.items).containsExactly("a", "b");
  }

  @Test
  void setNullFieldObject() throws Exception {
    var t = new Target();
    // null field reference should silently do nothing
    ValueWriter.setValue((java.lang.reflect.Field) null, t, "value");
  }

  @Test
  void setLocalDateFromString() throws Exception {
    var t = new Target();
    ValueWriter.setValue(Target.class.getDeclaredField("localDate"), t, "2024-01-15");
    assertEquals(LocalDate.of(2024, 1, 15), t.localDate);
  }

  @Test
  void setLocalDateTimeFromString() throws Exception {
    var t = new Target();
    ValueWriter.setValue(Target.class.getDeclaredField("localDateTime"), t, "2024-01-15T10:30:00");
    assertEquals(LocalDateTime.of(2024, 1, 15, 10, 30, 0), t.localDateTime);
  }

  @Test
  void setValueDoesNothingForUnknownField() throws Exception {
    var t = new Target();
    assertDoesNotThrow(() -> ValueWriter.setValue("nonExistent", t, "value"));
  }

  @Test
  void setBigDecimalByField() throws Exception {
    var t = new Target();
    ValueWriter.setValue(Target.class.getDeclaredField("bigDecimal"), t, new BigDecimal("3.14"));
    assertEquals(new BigDecimal("3.14"), t.bigDecimal);
  }
}
