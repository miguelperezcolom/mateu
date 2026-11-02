package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.RunActionRqDto;
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
import org.junit.jupiter.api.Test;

/**
 * A crud's built-in buttons (New, Delete, Back to list, Edit, Cancel, Save) speak the UI's
 * language: the browser's ({@code Accept-Language}, the language the client draws its own chrome
 * in) when the app has no translation for them. They were English in a Spanish UI — «Save» next to
 * the renderer's «Cancelar». A label the app writes itself is left as it is.
 */
class CrudBuiltInLabelsSyncTest {

  public static class Book implements Identifiable {
    public String id;
    public String title;

    public Book() {}

    Book(String id, String title) {
      this.id = id;
      this.title = title;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Book> BOOKS = List.of(new Book("b1", "Dune"));

  @UI("/books")
  @Title("Books")
  public static class Books extends AutoCrud<Book> {
    @Override
    public CrudStore<Book> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Book> findById(String id) {
          return BOOKS.stream().filter(b -> b.id.equals(id)).findFirst();
        }

        @Override
        public String save(Book entity) {
          return entity.id;
        }

        @Override
        public List<Book> findAll() {
          return BOOKS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  /** The app names its own New: that one stays as written, in any language. */
  @UI("/catalogue")
  @Title("Catalogue")
  public static class Catalogue extends Books {
    @Override
    public String newLabel() {
      return "Add a title";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Books.class, Catalogue.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<String> labels(String route, String acceptLanguage) {
    var base = "/" + route.split("/")[1];
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(base)
            .serverSideType((base.equals("/books") ? Books.class : Catalogue.class).getName())
            .actionId("")
            .initiatorComponentId("c1_app")
            .componentState(Map.of())
            .parameters(Map.of())
            .build();
    var increment =
        acceptLanguage == null
            ? mateu.run(rq)
            : mateu.run(rq, Map.of("Accept-Language", acceptLanguage));
    var labels = new ArrayList<String>();
    buttonLabels(increment.fragments(), labels);
    return labels;
  }

  /** Every ButtonDto's label, wherever it sits (a toolbar, a page's buttons, a component). */
  private static void buttonLabels(Object node, List<String> out) {
    if (node instanceof ButtonDto button) {
      out.add(button.label());
    }
    if (node instanceof Iterable<?> items) {
      items.forEach(item -> buttonLabels(item, out));
    } else if (node instanceof Map<?, ?> map) {
      map.values().forEach(value -> buttonLabels(value, out));
    } else if (node != null && node.getClass().isRecord()) {
      for (var component : node.getClass().getRecordComponents()) {
        try {
          buttonLabels(component.getAccessor().invoke(node), out);
        } catch (ReflectiveOperationException e) {
          throw new IllegalStateException(e);
        }
      }
    }
  }

  @Test
  void inASpanishUiTheCrudsOwnButtonsAreSpanish() {
    assertThat(labels("/books", "es-ES,es;q=0.9,en;q=0.8"))
        .contains("Nuevo", "Eliminar")
        .doesNotContain("New", "Delete");
    assertThat(labels("/books/b1", "es-ES")).contains("Volver al listado", "Editar");
    assertThat(labels("/books/b1/edit", "es")).contains("Cancelar", "Guardar");
    assertThat(labels("/books/new", "es-MX")).contains("Cancelar", "Guardar");
  }

  @Test
  void withNoLanguageOrOneMateuDoesNotSpeakTheyStayEnglish() {
    assertThat(labels("/books", null)).contains("New", "Delete");
    assertThat(labels("/books/b1/edit", "en-GB")).contains("Cancel", "Save");
    assertThat(labels("/books/b1", "fr-FR")).contains("Back to list", "Edit");
  }

  @Test
  void aLabelTheAppWritesIsLeftAsItIs() {
    assertThat(labels("/catalogue", "es-ES")).contains("Add a title", "Eliminar");
  }
}
