package io.mateu.explorer.examples.archetypes.herosearch;

import io.mateu.core.infra.declarative.orchestrators.herosearch.HeroSearch;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The {@code HeroSearch} archetype: a big hero with the search box, the {@code Filters} record as
 * facets and the results as cards. It starts empty and searches when you press Enter — implement
 * {@code search} exactly like any {@code Listing}.
 */
public class ArtworkHeroSearch
    extends HeroSearch<ArtworkHeroSearch.Filters, ArtworkHeroSearch.Artwork> {

  public record Filters(String classification) {}

  public record Artwork(String title, String artist, String classification, int year) {}

  static final List<Artwork> ARTWORKS =
      List.of(
          new Artwork("The Harvesters", "Pieter Bruegel", "Painting", 1565),
          new Artwork("Water Lilies", "Claude Monet", "Painting", 1906),
          new Artwork("The Great Wave", "Katsushika Hokusai", "Print", 1831),
          new Artwork("Bust of a Woman", "Pablo Picasso", "Sculpture", 1931),
          new Artwork("Self-Portrait", "Vincent van Gogh", "Painting", 1887),
          new Artwork("Melencolia I", "Albrecht Dürer", "Print", 1514));

  @Override
  protected String heroTitle() {
    return "Find an artwork";
  }

  @Override
  protected String heroSubtitle() {
    return "Try “monet”, “print” or a year — then narrow it with the classification facet";
  }

  @Override
  public ListingData<Artwork> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText() == null ? "" : request.searchText().toLowerCase();
    var filters = filters(request);
    return ListingData.from(
        ARTWORKS.stream()
            .filter(a -> (a.title() + " " + a.artist() + " " + a.classification() + " " + a.year())
                .toLowerCase()
                .contains(text))
            .filter(a -> filters == null
                || filters.classification() == null
                || filters.classification().isBlank()
                || a.classification().equalsIgnoreCase(filters.classification()))
            .toList());
  }
}
