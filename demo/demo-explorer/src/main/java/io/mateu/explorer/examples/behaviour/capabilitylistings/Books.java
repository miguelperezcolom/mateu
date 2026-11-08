package io.mateu.explorer.examples.behaviour.capabilitylistings;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Creatable;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.Searchable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * A listing that only has what it declares. {@code Listing<Book>} alone is a grid; each interface
 * adds exactly one thing:
 *
 * <ul>
 *   <li>{@code Searchable} — the search box (the text arrives in {@code request.searchText()});
 *   <li>{@code Filterable<BookFilters>} — the filter bar, built from {@link BookFilters};
 *   <li>{@code Navigable} — clickable rows (the whole row) and the read-only detail at {@code /:id};
 *   <li>{@code Creatable} — the New button and {@code /new};
 *   <li>{@code Deletable} — row selection and Delete.
 * </ul>
 *
 * There is no Edit: it was not declared.
 */
@Title("Books")
public class Books
    implements Listing<Books.Book>,
        Searchable,
        Filterable<Books.BookFilters>,
        Navigable<Books.Book, String>,
        Creatable<Books.Book, String>,
        Deletable<String> {

  public record Book(String id, String title, String author, Integer pages) {}

  /** A {@code NumberRange} is a min–max filter on any listing. */
  public record BookFilters(String author, NumberRange pages) {}

  static final String[][] SEED = {
    {"Don Quixote", "Cervantes"}, {"Hopscotch", "Cortázar"}, {"Ficciones", "Borges"},
    {"The Aleph", "Borges"}, {"Pedro Páramo", "Rulfo"}, {"Nada", "Laforet"},
    {"Fortunata y Jacinta", "Galdós"}, {"La Regenta", "Clarín"}, {"Blindness", "Saramago"},
    {"The Shadow of the Wind", "Ruiz Zafón"}
  };

  static final List<Book> BOOKS = new CopyOnWriteArrayList<>();

  static {
    for (int i = 0; i < 50; i++) {
      var seed = SEED[i % SEED.length];
      var title = i < SEED.length ? seed[0] : seed[0] + " (vol. " + (1 + i / SEED.length) + ")";
      BOOKS.add(new Book("B-" + (100 + i), title, seed[1], 120 + (i * 53) % 900));
    }
  }

  @Override
  public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText() == null ? "" : request.searchText().toLowerCase();
    var filters = filters(request);
    var rows =
        new ArrayList<>(
            BOOKS.stream()
                .filter(b -> (b.title() + " " + b.author()).toLowerCase().contains(text))
                .filter(
                    b ->
                        filters == null
                            || filters.author() == null
                            || filters.author().isBlank()
                            || b.author().toLowerCase().contains(filters.author().toLowerCase()))
                .filter(
                    b -> filters == null || filters.pages() == null || filters.pages().contains(b.pages()))
                .toList());
    // sort and page: what the grid asks for arrives in request.pageable()
    var pageable = request.pageable();
    for (var sort : pageable.sort().reversed()) {
      Comparator<Book> by =
          switch (sort.field()) {
            case "title" -> Comparator.comparing(Book::title);
            case "author" -> Comparator.comparing(Book::author);
            case "pages" -> Comparator.comparing(Book::pages);
            default -> Comparator.comparing(Book::id);
          };
      rows.sort("descending".equals(sort.direction().name()) ? by.reversed() : by);
    }
    int from = Math.min(pageable.page() * pageable.size(), rows.size());
    int to = Math.min(from + pageable.size(), rows.size());
    return new ListingData<>(
        new Page<>("", pageable.size(), pageable.page(), rows.size(), rows.subList(from, to)));
  }

  @Override
  public Book view(String id, HttpRequest httpRequest) {
    return BOOKS.stream().filter(b -> b.id().equals(id)).findFirst().orElseThrow();
  }

  @Override
  public Book creationForm(HttpRequest httpRequest) {
    return new Book(null, null, null, null);
  }

  @Override
  public String create(HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(Book.class);
    var id = "B-" + (100 + BOOKS.size());
    BOOKS.add(new Book(id, form.title(), form.author(), form.pages()));
    return id;
  }

  @Override
  public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
    BOOKS.removeIf(b -> ids.contains(b.id()));
  }
}
