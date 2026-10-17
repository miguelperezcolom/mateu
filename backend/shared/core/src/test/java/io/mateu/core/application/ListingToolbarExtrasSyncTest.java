package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.uidl.annotations.GroupAction;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.ReactiveListing;
import io.mateu.uidl.interfaces.UploadEnabled;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

/**
 * What a plain declarative listing adds to its toolbar by DECLARATION: {@link UploadEnabled} an
 * Import button, {@link Auditable} a History button, a {@code @GroupAction} method a button on
 * every group header; a class {@code @Style} is appended to the listing box; and a {@link
 * ReactiveListing} is a listing like any other.
 */
class ListingToolbarExtrasSyncTest {

  public record Book(String id, String title) {}

  @UI("/listing-extras")
  @Style("border: 1px solid red;")
  public static class Books implements Listing<Book>, UploadEnabled, Auditable {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Book("b1", "Rayuela")));
    }

    @Override
    public Object processUpload(String fileId, HttpRequest httpRequest) {
      return null;
    }

    @Override
    public ListingData<AuditEntry> history(
        String searchText, AuditFilters filters, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.from(List.of());
    }

    @GroupAction("Approve all")
    public void approveGroup() {}
  }

  @UI("/reactive-listing")
  public static class ReactiveBooks implements ReactiveListing<Book> {
    @Override
    public Mono<ListingData<Book>> search(SearchRequest request, HttpRequest httpRequest) {
      return Mono.just(ListingData.from(List.of(new Book("b1", "Rayuela"))));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Books.class, ReactiveBooks.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static CrudlDto crudl(String route) {
    var increment = mateu.sync(route);
    var found =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), CrudlDto.class);
    assertThat(found).as("a listing at " + route).isNotEmpty();
    return found.get(0);
  }

  @Test
  void declaredCapabilitiesAddTheirToolbarButtonsAndGroupActions() {
    var books = crudl("/listing-extras");
    assertThat(books.toolbar()).extracting(ButtonDto::actionId).contains("import", "history");
    assertThat(books.groupActions())
        .extracting(ButtonDto::label, ButtonDto::actionId)
        .containsExactly(org.assertj.core.groups.Tuple.tuple("Approve all", "approveGroup"));
    assertThat(String.valueOf(mateu.sync("/listing-extras"))).contains("border: 1px solid red;");
  }

  @Test
  void aReactiveListingRendersAsAListingWithoutRowSelection() {
    var books = crudl("/reactive-listing");
    assertThat(books.rowsSelectionEnabled()).isFalse();
    assertThat(books.toolbar()).extracting(ButtonDto::actionId).doesNotContain("import", "history");
  }
}
