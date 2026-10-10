package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Pattern gaps showcase: SmartSearchPage's pre-search content (the smart filter search dashboard). */
@UI("/patterns/search")
@Title("Find a guest")
public class GuestSearch extends SmartSearchPage<NoFilters, GuestSearch.Guest> {

  public record Guest(String id, String name, String room) {}

  static final List<Guest> GUESTS =
      List.of(
          new Guest("1", "Ada Lovelace", "101"),
          new Guest("2", "Grace Hopper", "102"),
          new Guest("3", "José Martí", "103"));

  @Override
  public ListingData<Guest> search(SearchRequest request, HttpRequest httpRequest) {
    var needle = request.searchText().toLowerCase();
    return ListingData.of(
        GUESTS.stream().filter(g -> g.name().toLowerCase().contains(needle)).toList());
  }

  @Override
  protected Component preSearchContent(HttpRequest httpRequest) {
    return EmptyState.builder()
        .icon("🔎")
        .title("Search to get started")
        .description("Recently viewed: Ada Lovelace, Grace Hopper")
        .build();
  }
}
