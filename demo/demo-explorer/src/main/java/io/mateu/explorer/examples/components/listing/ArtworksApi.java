package io.mateu.explorer.examples.components.listing;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A tiny REST endpoint for the Listing example — any JSON API would do; the listing fetches it from
 * the browser. It answers the whole collection, so the listing searches, sorts and pages in the
 * browser (declare a {@code totalPath} on the source when the API does that itself).
 */
@RestController
public class ArtworksApi {

  public record Artwork(String id, String title, String artist, int year, String status) {}

  @GetMapping("/explorer-api/artworks")
  public List<Artwork> artworks() {
    return List.of(
        new Artwork("a1", "The Starry Night", "Vincent van Gogh", 1889, "On display"),
        new Artwork("a2", "Sunflowers", "Vincent van Gogh", 1888, "On loan"),
        new Artwork("a3", "Las Meninas", "Diego Velázquez", 1656, "On display"),
        new Artwork("a4", "The Kiss", "Gustav Klimt", 1908, "In conservation"),
        new Artwork("a5", "Water Lilies", "Claude Monet", 1916, "On display"),
        new Artwork("a6", "Girl with a Pearl Earring", "Johannes Vermeer", 1665, "On loan"),
        new Artwork("a7", "The Night Watch", "Rembrandt", 1642, "In conservation"),
        new Artwork("a8", "The Garden of Earthly Delights", "Hieronymus Bosch", 1500, "On display"));
  }
}
