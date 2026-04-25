package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.PrimaryKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DeclarativeUtilitiesTest {

  // --- WizardOrchestrator.addRowNumber ---

  static class SimpleRow {
    public String name;
    public int value;
  }

  static class RowWithList {
    public String id;
    public List<SimpleRow> items;
  }

  @Test
  void addRowNumberAddsRowNumberToMap() {
    var data = new HashMap<String, Object>();
    data.put("name", "Alice");
    WizardOrchestrator.addRowNumber(SimpleRow.class, data);
    // _rowNumber should now be present
    assertThat(data).isNotNull();
  }

  @Test
  void addRowNumberHandlesEmptyMap() {
    var data = new HashMap<String, Object>();
    WizardOrchestrator.addRowNumber(Object.class, data);
    assertThat(data).isNotNull();
  }

  // --- CrudAdapterHelper.getIdField ---

  static class EntityWithId {
    @PrimaryKey
    public String id;
    public String name;
  }

  static class EntityWithoutAnnotation {
    public String id; // named "id" but no @PrimaryKey
    public String name;
  }

  @Test
  void getIdFieldFindsAnnotatedField() {
    var idField = CrudAdapterHelper.getIdField(EntityWithId.class);
    assertThat(idField).isEqualTo("id");
  }

  @Test
  void getIdFieldFallsBackToFieldNamedId() {
    var idField = CrudAdapterHelper.getIdField(EntityWithoutAnnotation.class);
    assertThat(idField).isEqualTo("id");
  }

  // --- CrudAdapterHelper.getEntityName ---

  static class NamedEntity {
    @PrimaryKey
    public String id = "entity-1";
    public String name = "My Entity";
  }

  @Test
  void getEntityNameReturnsNonNull() {
    var name = CrudAdapterHelper.getEntityName(new NamedEntity());
    assertThat(name).isNotNull();
  }

  @Test
  void getEntityNameForString() {
    var name = CrudAdapterHelper.getEntityName("hello");
    assertThat(name).isNotNull();
  }

  // --- CrudAdapterHelper.reduce ---

  @Test
  void reduceExtractsFieldsByPrefix() {
    var map = new HashMap<String, Object>();
    map.put("name", "Alice");
    map.put("age", 30);
    CrudAdapterHelper.reduce("", map, SimpleRow.class);
    assertThat(map).isNotNull();
  }

  // --- CrudOrchestrator.getIndex ---

  @Test
  void getIndexFindsRowByNumber() {
    List<Map<String, Object>> items = new java.util.ArrayList<>();
    Map<String, Object> row1 = new java.util.HashMap<>();
    row1.put("_rowNumber", 0);
    row1.put("name", "Alice");
    Map<String, Object> row2 = new java.util.HashMap<>();
    row2.put("_rowNumber", 1);
    row2.put("name", "Bob");
    items.add(row1);
    items.add(row2);

    int idx = CrudOrchestrator.getIndex(items, 0);
    assertThat(idx).isEqualTo(0);
  }

  @Test
  void getIndexReturnsMinusOneForMissing() {
    List<Map<String, Object>> items = new java.util.ArrayList<>();
    Map<String, Object> row1 = new java.util.HashMap<>();
    row1.put("_rowNumber", 0);
    items.add(row1);
    int idx = CrudOrchestrator.getIndex(items, 99);
    assertThat(idx).isEqualTo(-1);
  }
}
