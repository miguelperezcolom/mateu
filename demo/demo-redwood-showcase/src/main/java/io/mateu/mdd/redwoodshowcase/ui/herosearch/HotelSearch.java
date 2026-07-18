package io.mateu.mdd.redwoodshowcase.ui.herosearch;

import io.mateu.core.infra.declarative.orchestrators.herosearch.HeroSearch;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Demo of the {@link HeroSearch} archetype: a distraction-free landing page with a big hero
 * header, a prominent search box, filter facets and card results.
 */
@UI("/hotel-search")
@Title("Hotel search")
public class HotelSearch extends HeroSearch<HotelSearch.HotelFilters, HotelSearch.Hotel> {

  public record HotelFilters(String zone, Integer minStars) {}

  public record Hotel(String name, String zone, int stars, String price) {}

  private static final List<Hotel> HOTELS =
      List.of(
          new Hotel("Playa Azul", "Beach", 4, "120 €"),
          new Hotel("Gran Vía Palace", "City center", 5, "210 €"),
          new Hotel("Serra Verda", "Mountain", 3, "80 €"),
          new Hotel("Mar i Cel", "Beach", 5, "260 €"),
          new Hotel("Urban Loft", "City center", 4, "140 €"),
          new Hotel("Refugi Alpí", "Mountain", 2, "60 €"));

  @Override
  protected String heroTitle() {
    return "Find your hotel";
  }

  @Override
  protected String heroSubtitle() {
    return "Search by name or zone, filter by category, and pick your stay";
  }

  @Override
  public ListingData<Hotel> search(
      String searchText, HotelFilters filters, Pageable pageable, HttpRequest httpRequest) {
    var found =
        HOTELS.stream()
            .filter(
                hotel ->
                    searchText == null
                        || searchText.isBlank()
                        || (hotel.name() + " " + hotel.zone())
                            .toLowerCase()
                            .contains(searchText.toLowerCase()))
            .filter(
                hotel ->
                    filters == null
                        || filters.zone() == null
                        || filters.zone().isBlank()
                        || hotel.zone().equalsIgnoreCase(filters.zone()))
            .filter(
                hotel ->
                    filters == null || filters.minStars() == null || hotel.stars() >= filters.minStars())
            .toList();
    return ListingData.<Hotel>builder()
        .page(
            Page.<Hotel>builder()
                .content(found)
                .totalElements(found.size())
                .pageNumber(0)
                .pageSize(found.size())
                .build())
        .build();
  }
}
