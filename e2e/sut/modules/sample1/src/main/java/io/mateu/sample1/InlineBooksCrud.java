package io.mateu.sample1;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.SearchableText;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentSkipListMap;

/**
 * An {@code @InlineEditing} listing whose rows have an enum, a date, a number and texts — every
 * editor kind vaadin-grid RECYCLES for other rows. 3.0-beta.68: searching it ("le guin") made the
 * browser save rows nobody edited with another row's values (tests/shared/inline-edit-search.spec.ts).
 * {@link InlineBooksCheck} shows the same store without editors, so a test can read what is stored.
 */
@UI("/inline-books")
@Title("Inline books")
@InlineEditing
public class InlineBooksCrud extends AutoCrud<InlineBooksCrud.Book> {

  public enum Genre {
    Fantasy,
    ScienceFiction,
    Mystery,
    History,
    Poetry
  }

  public record Book(
      @Hidden String id, String title, String author, Genre genre, LocalDate published, int pages)
      implements Identifiable, SearchableText {

    @Override
    public String searchableText() {
      return title + " " + author;
    }

    @Override
    public String toString() {
      return title;
    }
  }

  static final Map<String, Book> BOOKS = new ConcurrentSkipListMap<>();

  static {
    for (var b :
        List.of(
            new Book("B-001", "The Hobbit", "J. R. R. Tolkien", Genre.Fantasy, LocalDate.parse("1937-09-21"), 310),
            new Book("B-002", "The Fellowship of the Ring", "J. R. R. Tolkien", Genre.Fantasy, LocalDate.parse("1954-07-29"), 423),
            new Book("B-003", "A Wizard of Earthsea", "Ursula K. Le Guin", Genre.Fantasy, LocalDate.parse("1968-11-01"), 183),
            new Book("B-004", "The Left Hand of Darkness", "Ursula K. Le Guin", Genre.ScienceFiction, LocalDate.parse("1969-03-01"), 286),
            new Book("B-005", "Dune", "Frank Herbert", Genre.ScienceFiction, LocalDate.parse("1965-08-01"), 412),
            new Book("B-006", "The Hound of the Baskervilles", "Arthur Conan Doyle", Genre.Mystery, LocalDate.parse("1902-04-01"), 256))) {
      BOOKS.put(b.id(), b);
    }
  }

  static CrudStore<Book> books() {
    return new CrudStore<>() {
      @Override
      public Optional<Book> findById(String id) {
        return Optional.ofNullable(BOOKS.get(id));
      }

      @Override
      public String save(Book entity) {
        BOOKS.put(entity.id(), entity);
        return entity.id();
      }

      @Override
      public List<Book> findAll() {
        return new ArrayList<>(BOOKS.values());
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ids.forEach(BOOKS::remove);
      }
    };
  }

  @Override
  public CrudStore<Book> store() {
    return books();
  }
}
