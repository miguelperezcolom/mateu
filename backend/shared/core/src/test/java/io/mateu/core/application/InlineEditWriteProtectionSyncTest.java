package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * NM11: {@code update-row} (inline editing) is a write path like save, so it gets save's protection
 * — the fields the user may not write keep the stored values, an id with no stored row is refused
 * (never inserted), a row carrying only its columns keeps the record's other fields — and it is
 * offered only by a crud that edits inline and lets the user edit at all.
 */
class InlineEditWriteProtectionSyncTest {

  public static class Part implements Identifiable {
    String id;
    String name;
    @ReadOnly String code;
    int units;

    public Part() {}

    Part(String id, String name, String code, int units) {
      this.id = id;
      this.name = name;
      this.code = code;
      this.units = units;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Part> PARTS = new ArrayList<>();

  static CrudStore<Part> parts() {
    return new CrudStore<>() {
      @Override
      public Optional<Part> findById(String id) {
        return PARTS.stream().filter(p -> p.id.equals(id)).findFirst();
      }

      @Override
      public String save(Part entity) {
        PARTS.removeIf(p -> p.id.equals(entity.id));
        PARTS.add(entity);
        return entity.id;
      }

      @Override
      public List<Part> findAll() {
        return PARTS;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        PARTS.removeIf(p -> ids.contains(p.id));
      }
    };
  }

  @UI("/inline-parts")
  @Title("Parts")
  @InlineEditing
  public static class InlineParts extends AutoCrud<Part> {
    @Override
    public CrudStore<Part> store() {
      return parts();
    }
  }

  @UI("/plain-parts")
  @Title("Parts")
  public static class PlainParts extends AutoCrud<Part> {
    @Override
    public CrudStore<Part> store() {
      return parts();
    }
  }

  @UI("/frozen-parts")
  @Title("Parts")
  @InlineEditing
  public static class FrozenParts extends AutoCrud<Part> {
    @Override
    public CrudStore<Part> store() {
      return parts();
    }

    @Override
    public boolean canEdit() {
      return false;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(InlineParts.class, PlainParts.class, FrozenParts.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    PARTS.clear();
    PARTS.add(new Part("p1", "Bolt", "B-01", 10));
  }

  private static UIIncrementDto updateRow(Class<?> crud, String route, Map<String, Object> row) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(crud.getName())
            .actionId("update-row")
            .initiatorComponentId("c1")
            .componentState(Map.of())
            .parameters(Map.of("_editedRow", row))
            .build());
  }

  private static Part stored(String id) {
    return PARTS.stream().filter(p -> p.id.equals(id)).findFirst().orElse(null);
  }

  @Test
  void aReadOnlyFieldKeepsTheStoredValue() {
    updateRow(
        InlineParts.class,
        "/inline-parts",
        Map.of("id", "p1", "name", "Bolt M8", "code", "HACKED", "units", 12));
    assertThat(stored("p1").name).isEqualTo("Bolt M8");
    assertThat(stored("p1").units).isEqualTo(12);
    assertThat(stored("p1").code).isEqualTo("B-01");
  }

  @Test
  void anIdWithNoStoredRowIsRefusedNeverInserted() {
    var increment =
        updateRow(InlineParts.class, "/inline-parts", Map.of("id", "p-new", "name", "Injected"));
    assertThat(stored("p-new")).isNull();
    assertThat(PARTS).hasSize(1);
    assertThat(increment.messages()).isNotEmpty();
  }

  /** N4: a non-map _editedRow is a crafted request — said as written, never an ERROR + stack. */
  @Test
  void aNonMapEditedRowIsAMessageNotAnErrorInTheLog() {
    var logger =
        (ch.qos.logback.classic.Logger)
            org.slf4j.LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
    var logs =
        new ch.qos.logback.core.read.ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>();
    logs.start();
    logger.addAppender(logs);
    UIIncrementDto increment;
    try {
      increment =
          mateu.run(
              RunActionRqDto.builder()
                  .route("/inline-parts")
                  .consumedRoute("/inline-parts")
                  .serverSideType(InlineParts.class.getName())
                  .actionId("update-row")
                  .initiatorComponentId("c1")
                  .componentState(Map.of())
                  .parameters(Map.of("_editedRow", "p1"))
                  .build());
    } finally {
      logger.detachAppender(logs);
    }
    assertThat(increment.messages())
        .anySatisfy(m -> assertThat(m.text()).contains("update-row requires an _editedRow"));
    assertThat(logs.list)
        .filteredOn(e -> e.getLevel() == ch.qos.logback.classic.Level.ERROR)
        .isEmpty();
    assertThat(stored("p1").name).isEqualTo("Bolt");
  }

  @Test
  void aRowCarryingOnlySomeColumnsKeepsTheOtherFields() {
    updateRow(InlineParts.class, "/inline-parts", Map.of("id", "p1", "units", 99));
    assertThat(stored("p1").units).isEqualTo(99);
    assertThat(stored("p1").name).isEqualTo("Bolt");
    assertThat(stored("p1").code).isEqualTo("B-01");
  }

  @Test
  void aCrudThatDoesNotEditInlineRefusesIt() {
    assertThatThrownBy(
            () -> updateRow(PlainParts.class, "/plain-parts", Map.of("id", "p1", "name", "X")))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(stored("p1").name).isEqualTo("Bolt");
  }

  @Test
  void aCrudThatDoesNotLetTheUserEditRefusesIt() {
    assertThatThrownBy(
            () -> updateRow(FrozenParts.class, "/frozen-parts", Map.of("id", "p1", "name", "X")))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(stored("p1").name).isEqualTo("Bolt");
  }
}
