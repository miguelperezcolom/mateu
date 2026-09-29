package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@code @Lookup} field of a listing's filters searches its options like one of a form does.
 *
 * <p>The filter went out without its remote coordinates — the crud's filter mapping dropped them —
 * so no renderer had a search to run and its editor came up empty. And the search itself, sent to
 * the crud that owns the listing, looked the field up on the crud's view model, which knows nothing
 * of its filters.
 */
class FilterLookupSyncTest {

  public static class Hotels implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.of(new Option("MRU01", "MRU01 · Mauricio"), new Option("PMI01", "PMI01"));
    }
  }

  public static class Filters {
    @Lookup(search = Hotels.class)
    String hotel;

    String text;
  }

  public static class Entry implements Identifiable {
    String id;
    String hotel;

    @Override
    public String id() {
      return id;
    }
  }

  public record EntryRow(String id, String hotel) {}

  @UI("/filter-lookups")
  @Title("Entries")
  public static class EntriesCrud extends Crud<Entry, Entry, Entry, Filters, EntryRow, String> {

    @Override
    public ListingData<EntryRow> search(SearchRequest request, HttpRequest httpRequest) {
      var rows = List.of(new EntryRow("e1", "MRU01"));
      return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
    }

    @Override
    public Entry view(String id, HttpRequest httpRequest) {
      return new Entry();
    }

    @Override
    public Entry edit(String id, HttpRequest httpRequest) {
      return new Entry();
    }

    @Override
    public Entry creationForm(HttpRequest httpRequest) {
      return new Entry();
    }

    @Override
    public String create(HttpRequest httpRequest) {
      return "e1";
    }

    @Override
    public String save(HttpRequest httpRequest) {
      return "e1";
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(EntriesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private FormFieldDto filter(String fieldId) {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/filter-lookups")
                .consumedRoute("/filter-lookups")
                .serverSideType(EntriesCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .build());
    var crudls = new ArrayList<CrudlDto>();
    increment
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), CrudlDto.class, crudls));
    return crudls.stream()
        .flatMap(crudl -> crudl.filters().stream())
        .filter(f -> fieldId.equals(f.fieldId()))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void aLookupFilterCarriesItsSearch() {
    var hotel = filter("hotel");
    assertThat(hotel.stereotype()).isEqualTo("combobox");
    assertThat(hotel.remoteCoordinates()).isNotNull();
    assertThat(hotel.remoteCoordinates().action()).isEqualTo("search-hotel");
  }

  @Test
  void aPlainFilterHasNoSearch() {
    assertThat(filter("text").remoteCoordinates()).isNull();
  }

  @Test
  void theCrudAnswersTheSearchOfItsFilter() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/filter-lookups")
                .consumedRoute("/filter-lookups")
                .actionId("search-hotel")
                .serverSideType(EntriesCrud.class.getName())
                .componentState(Map.of())
                .parameters(Map.of("searchText", "", "page", 0, "size", 200))
                .initiatorComponentId("c1_app")
                .build());
    assertThat(increment.messages()).isEmpty();
    var data =
        increment.fragments().stream()
            .map(fragment -> fragment.data())
            .filter(d -> d instanceof Map<?, ?> map && map.containsKey("hotel"))
            .findFirst()
            .orElseThrow();
    assertThat(String.valueOf(data)).contains("MRU01 · Mauricio", "PMI01");
  }
}
