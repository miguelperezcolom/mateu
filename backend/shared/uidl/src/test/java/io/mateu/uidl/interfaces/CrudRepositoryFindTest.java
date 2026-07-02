package io.mateu.uidl.interfaces;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * Verifies the default in-memory implementation of {@link CrudRepository#find(String, Identifiable,
 * Pageable)}: it filters {@link CrudRepository#findAll()} by {@code searchText}, sorts by {@link
 * Pageable#sort()} (read reflectively) and paginates, returning a {@link Page} whose {@code
 * totalElements} reflects the filtered (not the paged) count.
 */
class CrudRepositoryFindTest {

  /** Record entity — accessors are {@code id()}/{@code name()}/{@code price()} (record style). */
  record Product(String id, String name, int price) implements Identifiable {}

  /** A {@link Searchable} entity whose searchable text differs from {@code toString()}. */
  record Doc(String id, String tag) implements Identifiable, Searchable {
    @Override
    public String searchableText() {
      return tag;
    }

    @Override
    public String toString() {
      return "opaque-" + id;
    }
  }

  /** Backs {@code find(...)} purely through {@code findAll()} — everything else is unused here. */
  static <T extends Identifiable> CrudRepository<T> repoOf(List<T> rows) {
    return new CrudRepository<>() {
      @Override
      public Optional<T> findById(String id) {
        return rows.stream().filter(r -> r.id().equals(id)).findFirst();
      }

      @Override
      public String save(T entity) {
        return entity.id();
      }

      @Override
      public List<T> findAll() {
        return rows;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }

  private static Pageable page(int page, int size, Sort... sort) {
    return new Pageable(page, size, List.of(sort));
  }

  @Test
  void nullPageableReturnsEverythingInOnePage() {
    var repo = repoOf(List.of(new Product("1", "A", 10), new Product("2", "B", 20)));

    Page<Product> result = repo.find(null, null, null);

    assertThat(result.content()).hasSize(2);
    assertThat(result.totalElements()).isEqualTo(2);
    assertThat(result.pageNumber()).isZero();
  }

  @Test
  void filtersBySearchTextUsingToStringCaseInsensitively() {
    var repo =
        repoOf(
            List.of(
                new Product("1", "Widget", 10),
                new Product("2", "Gadget", 20),
                new Product("3", "Gizmo", 30)));

    // Product has no custom toString(); the record's toString() contains the field values.
    Page<Product> result = repo.find("gADg", null, null);

    assertThat(result.content()).extracting(Product::id).containsExactly("2");
    assertThat(result.totalElements()).isEqualTo(1);
  }

  @Test
  void filtersBySearchableTextWhenEntityIsSearchable() {
    var repo =
        repoOf(
            List.of(
                new Doc("1", "invoice"), new Doc("2", "receipt"), new Doc("3", "invoice-note")));

    // "opaque-1" (toString) would NOT match; "invoice" (searchableText) does.
    Page<Doc> result = repo.find("invoice", null, null);

    assertThat(result.content()).extracting(Doc::id).containsExactly("1", "3");
  }

  @Test
  void sortsAscendingByReflectiveField() {
    var repo =
        repoOf(
            List.of(
                new Product("1", "Charlie", 10),
                new Product("2", "Alice", 20),
                new Product("3", "Bob", 30)));

    Page<Product> result =
        repo.find(null, null, page(0, 10, new Sort("name", Direction.ascending)));

    assertThat(result.content())
        .extracting(Product::name)
        .containsExactly("Alice", "Bob", "Charlie");
  }

  @Test
  void sortsDescendingByReflectiveField() {
    var repo =
        repoOf(
            List.of(
                new Product("1", "A", 10), new Product("2", "B", 30), new Product("3", "C", 20)));

    Page<Product> result =
        repo.find(null, null, page(0, 10, new Sort("price", Direction.descending)));

    assertThat(result.content()).extracting(Product::price).containsExactly(30, 20, 10);
  }

  @Test
  void appliesMultiFieldSortInOrder() {
    var repo =
        repoOf(
            List.of(
                new Product("1", "A", 20), new Product("2", "A", 10), new Product("3", "B", 5)));

    Page<Product> result =
        repo.find(
            null,
            null,
            page(
                0,
                10,
                new Sort("name", Direction.ascending),
                new Sort("price", Direction.ascending)));

    // name asc first, then price asc within the same name.
    assertThat(result.content()).extracting(Product::id).containsExactly("2", "1", "3");
  }

  @Test
  void paginatesAndReportsTotalOfFilteredNotPagedRows() {
    var rows =
        List.of(
            new Product("1", "P1", 1),
            new Product("2", "P2", 2),
            new Product("3", "P3", 3),
            new Product("4", "P4", 4),
            new Product("5", "P5", 5));
    var repo = repoOf(rows);

    Page<Product> secondPage =
        repo.find(null, null, page(1, 2, new Sort("price", Direction.ascending)));

    assertThat(secondPage.pageNumber()).isEqualTo(1);
    assertThat(secondPage.pageSize()).isEqualTo(2);
    assertThat(secondPage.totalElements()).isEqualTo(5);
    assertThat(secondPage.content()).extracting(Product::id).containsExactly("3", "4");
  }

  @Test
  void lastPartialPageDoesNotOverflow() {
    var rows =
        List.of(new Product("1", "P1", 1), new Product("2", "P2", 2), new Product("3", "P3", 3));
    var repo = repoOf(rows);

    Page<Product> lastPage =
        repo.find(null, null, page(1, 2, new Sort("price", Direction.ascending)));

    assertThat(lastPage.content()).extracting(Product::id).containsExactly("3");
    assertThat(lastPage.totalElements()).isEqualTo(3);
  }

  @Test
  void pageBeyondRangeReturnsEmptyContentButKeepsTotal() {
    var repo = repoOf(List.of(new Product("1", "P1", 1), new Product("2", "P2", 2)));

    Page<Product> result = repo.find(null, null, page(5, 2));

    assertThat(result.content()).isEmpty();
    assertThat(result.totalElements()).isEqualTo(2);
  }

  @Test
  void nullSortValuesAreOrderedLast() {
    var repo =
        repoOf(
            List.of(
                new Product("1", "Beta", 10),
                new Product("2", null, 20),
                new Product("3", "Alpha", 30)));

    Page<Product> result =
        repo.find(null, null, page(0, 10, new Sort("name", Direction.ascending)));

    assertThat(result.content()).extracting(Product::id).containsExactly("3", "1", "2");
  }
}
