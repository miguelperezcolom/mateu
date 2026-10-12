package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.Searchable;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

/**
 * A read-only finder built from capabilities, in the framework-agnostic module so every adapter
 * serves it: rows ({@link Listing}) + the search box ({@link Searchable}) + a filter bar built from a
 * TYPED filters record ({@link Filterable} — a text field, a {@link NumberRange}, a {@link
 * DateRange} and a {@code Set<Genre>}) + clickable rows ({@link Navigable}). It honours the page,
 * the size and the sort of the request itself, as a listing over a query service would, so the
 * walkthrough can tell the server's paging from a client's.
 */
@UI("/capability-books")
@Title("Capability books")
public class CapabilityBooks
    implements Listing<CapabilityBooks.Book>,
        Searchable,
        Filterable<CapabilityBooks.BookFilters>,
        Navigable<CapabilityBooks.Book, String> {

  public enum Genre {
    NOVEL,
    POETRY,
    ESSAY
  }

  public record Book(
      String id, String title, String author, int pages, LocalDate published, Genre genre) {}

  public record BookFilters(
      String author, NumberRange pages, DateRange published, Set<Genre> genre) {}

  static final List<Book> BOOKS =
      IntStream.rangeClosed(1, 30)
          .mapToObj(
              i ->
                  new Book(
                      "B-%02d".formatted(i),
                      "Book %02d".formatted(i),
                      i % 3 == 0 ? "Cervantes" : i % 3 == 1 ? "Borges" : "Cortázar",
                      i * 10,
                      LocalDate.of(2000 + i, 1 + (i % 12), 1),
                      Genre.values()[i % 3]))
          .toList();

  @Override
  public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
    var words = request.searchText().trim().toLowerCase();
    var filters = filters(request);
    var stream =
        BOOKS.stream()
            .filter(
                b ->
                    words.isEmpty()
                        || List.of(words.split("\\s+")).stream()
                            .allMatch(
                                w -> (b.title() + " " + b.author()).toLowerCase().contains(w)));
    if (filters != null) {
      if (filters.author() != null && !filters.author().isBlank()) {
        stream =
            stream.filter(
                b -> b.author().toLowerCase().contains(filters.author().trim().toLowerCase()));
      }
      if (filters.pages() != null && !filters.pages().isEmpty()) {
        stream = stream.filter(b -> filters.pages().contains(b.pages()));
      }
      if (filters.published() != null && !filters.published().isEmpty()) {
        stream = stream.filter(b -> filters.published().contains(b.published()));
      }
      if (filters.genre() != null && !filters.genre().isEmpty()) {
        stream = stream.filter(b -> filters.genre().contains(b.genre()));
      }
    }
    var matched = stream.sorted(comparatorOf(request)).toList();
    var pageable = request.pageable();
    int size = pageable != null && pageable.size() > 0 ? pageable.size() : 10;
    int page = pageable != null ? Math.max(0, pageable.page()) : 0;
    var content = matched.stream().skip((long) page * size).limit(size).toList();
    return new ListingData<>(new Page<>("", size, page, matched.size(), content));
  }

  private static Comparator<Book> comparatorOf(SearchRequest request) {
    Comparator<Book> comparator = Comparator.comparing(Book::id);
    if (request.pageable() == null || request.pageable().sort() == null) {
      return comparator;
    }
    for (Sort sort : request.pageable().sort()) {
      Comparator<Book> by =
          switch (sort.field()) {
            case "title" -> Comparator.comparing(Book::title);
            case "author" -> Comparator.comparing(Book::author);
            case "pages" -> Comparator.comparingInt(Book::pages);
            case "published" -> Comparator.comparing(Book::published);
            default -> null;
          };
      if (by != null) {
        comparator = sort.direction() == Direction.descending ? by.reversed() : by;
      }
    }
    return comparator;
  }

  /** The built-in CSV export (Excel/PDF only show while an app registers an exporter for them). */
  @Override
  public boolean csvExportable() {
    return true;
  }

  @Override
  public boolean excelExportable() {
    return true;
  }

  @Override
  public Book view(String id, HttpRequest httpRequest) {
    return BOOKS.stream().filter(b -> b.id().equals(id)).findFirst().orElseThrow();
  }
}
