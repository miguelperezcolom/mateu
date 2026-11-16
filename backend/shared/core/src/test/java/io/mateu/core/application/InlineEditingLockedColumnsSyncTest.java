package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Version;
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
 * An {@code @InlineEditing} listing edits EXISTING records in place, so a column whose value an
 * edit never takes from the client is not an editor: {@code @EditableOnlyWhenCreating} (the cell
 * accepted typing, the update-row save kept the stored value — the edit was silently lost), the
 * record's id and the optimistic-lock version. The other data columns still are.
 */
class InlineEditingLockedColumnsSyncTest {

  public static class Volume implements Identifiable {
    @Label("Code")
    @PrimaryKey
    String code;

    String title;

    @Label("ISBN")
    @EditableOnlyWhenCreating
    String isbn;

    @Label("Revision")
    @Version
    int version;

    public Volume() {}

    Volume(String code, String title, String isbn) {
      this.code = code;
      this.title = title;
      this.isbn = isbn;
    }

    @Override
    public String id() {
      return code;
    }
  }

  static final List<Volume> VOLUMES = new ArrayList<>();

  @UI("/inline-volumes")
  @Title("Volumes")
  @InlineEditing
  public static class InlineVolumes extends AutoCrud<Volume> {
    @Override
    public CrudStore<Volume> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Volume> findById(String id) {
          return VOLUMES.stream().filter(v -> v.code.equals(id)).findFirst();
        }

        @Override
        public String save(Volume entity) {
          VOLUMES.replaceAll(v -> v.code.equals(entity.code) ? entity : v);
          return entity.code;
        }

        @Override
        public List<Volume> findAll() {
          return VOLUMES;
        }

        @Override
        public void deleteAllById(List<String> ids) {
          VOLUMES.removeIf(v -> ids.contains(v.code));
        }
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(InlineVolumes.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    VOLUMES.clear();
    VOLUMES.add(new Volume("V1", "Earthsea", "978-0-553-26250-9"));
  }

  @Test
  void onlyTheColumnsAnEditTakesAreEditors() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/inline-volumes")
                .consumedRoute("/inline-volumes")
                .serverSideType(InlineVolumes.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .componentState(Map.of("_route", "list"))
                .build());
    var columns = new ArrayList<GridColumnDto>();
    increment.fragments().forEach(fragment -> collect(fragment.component(), columns));

    assertThat(columns).extracting(GridColumnDto::id).contains("title", "isbn", "code", "version");
    assertThat(columns).filteredOn(c -> "title".equals(c.id())).allMatch(GridColumnDto::editable);
    assertThat(columns)
        .filteredOn(c -> List.of("isbn", "code", "version").contains(c.id()))
        .isNotEmpty()
        .noneMatch(GridColumnDto::editable)
        .allMatch(c -> c.editorType() == null);
  }

  private static void collect(Object component, List<GridColumnDto> out) {
    if (component instanceof ClientSideComponentDto client) {
      if (client.metadata() instanceof GridColumnDto column) {
        out.add(column);
      }
      if (client.metadata() instanceof CrudlDto crudl) {
        crudl.columns().forEach(column -> collect(column, out));
      }
      client.children().forEach(child -> collect(child, out));
    }
    if (component instanceof ServerSideComponentDto server) {
      server.children().forEach(child -> collect(child, out));
    }
  }
}
