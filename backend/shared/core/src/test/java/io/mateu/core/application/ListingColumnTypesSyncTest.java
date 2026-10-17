package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ValueMapping;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The dataType each kind of row field gives its listing column — what decides how every renderer
 * aligns, formats and sorts the cell: action / action-group / status cells, status and mapped
 * values declared by annotation, integers and decimals (right-aligned, numeric sort), booleans, and
 * a stereotype that takes over the presentation.
 */
class ListingColumnTypesSyncTest {

  public static class Row implements Identifiable {
    String id;
    ColumnAction open;
    ColumnActionGroup more;
    io.mateu.uidl.data.Status health;

    @Status(
        mappings = {@StatusMapping(from = "ok", to = StatusType.SUCCESS)},
        defaultStatus = StatusType.WARNING)
    String state;

    @MappedValue(
        mappings = {@ValueMapping(from = "1", to = "One")},
        defaultValue = "Other")
    int code;

    int units;
    long views;
    Short shelf;
    BigInteger serial;
    double ratio;
    Float weight;
    BigDecimal price;

    @Stereotype(FieldStereotype.money)
    BigDecimal total;

    boolean active;
    Boolean archived;
    String name;

    public Row() {}

    @Override
    public String id() {
      return id;
    }
  }

  @UI("/column-types")
  @Title("Column types")
  public static class Rows extends AutoCrud<Row> {
    @Override
    public CrudStore<Row> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Row> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Row entity) {
          return entity.id;
        }

        @Override
        public List<Row> findAll() {
          return List.of();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Rows.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static CrudlDto findCrudl(ComponentDto component) {
    if (component instanceof ClientSideComponentDto client) {
      if (client.metadata() instanceof CrudlDto crudl) return crudl;
      for (var child : client.children()) {
        var found = findCrudl(child);
        if (found != null) return found;
      }
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findCrudl(child);
        if (found != null) return found;
      }
    }
    return null;
  }

  @Test
  void eachRowFieldKindGivesItsColumnTheMatchingDataType() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/column-types")
                .consumedRoute("/column-types")
                .serverSideType(Rows.class.getName())
                .actionId("")
                .initiatorComponentId("ct_app")
                .componentState(Map.of())
                .build());
    var crudl = findCrudl(increment.fragments().get(0).component());
    assertThat(crudl).isNotNull();
    var byId = new java.util.HashMap<String, GridColumnDto>();
    for (var col : crudl.columns()) {
      if (col instanceof ClientSideComponentDto c && c.metadata() instanceof GridColumnDto gc) {
        byId.put(gc.id(), gc);
      }
    }
    var types = new java.util.TreeMap<String, String>();
    byId.forEach((id, col) -> types.put(id, String.valueOf(col.dataType())));

    assertThat(types)
        .containsEntry("open", "action")
        .containsEntry("more", "actionGroup")
        .containsEntry("health", "status")
        .containsEntry("state", "status")
        .containsEntry("code", "string") // a mapped value shows its label, not the number
        .containsEntry("units", "integer")
        .containsEntry("views", "integer")
        .containsEntry("shelf", "integer")
        .containsEntry("serial", "integer")
        .containsEntry("ratio", "number")
        .containsEntry("weight", "number")
        .containsEntry("price", "number")
        .containsEntry("active", "bool")
        .containsEntry("archived", "bool")
        .containsEntry("name", "string");
    assertThat(byId.get("total").stereotype()).isEqualTo("money");
    assertThat(byId.get("name").stereotype()).isEqualTo("regular");
  }
}
