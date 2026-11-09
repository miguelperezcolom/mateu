package io.mateu.explorer.examples.pagetemplates.data;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * The tiny REST API the YAML page templates read their listings from (a YAML page has no Java
 * behind it — its rows come from a REST source). Answers the paged envelope {@code {content,
 * totalElements}} that a source's {@code itemsPath}/{@code totalPath} read.
 */
@RestController
public class MuseumApi {

  public record Artist(String id, String name, String nationality, String lived, int works, String bio) {}

  public record Artwork(
      String id, String title, String artist, int year, String classification, String museum, String status) {}

  public static final List<Artist> ARTISTS =
      List.of(
          new Artist("monet", "Claude Monet", "French", "1840–1926", 14,
              "Founder of Impressionism; painted the water lilies of Giverny for thirty years."),
          new Artist("hokusai", "Katsushika Hokusai", "Japanese", "1760–1849", 9,
              "Ukiyo-e master, best known for the Thirty-six Views of Mount Fuji."),
          new Artist("kahlo", "Frida Kahlo", "Mexican", "1907–1954", 3,
              "Self-portraits that mix Mexican folk art with surrealism."),
          new Artist("durer", "Albrecht Dürer", "German", "1471–1528", 22,
              "Painter and printmaker of the Northern Renaissance."));

  public static final List<Artwork> ARTWORKS =
      List.of(
          new Artwork("a1", "Water Lilies", "Claude Monet", 1906, "Painting", "The Met", "On loan"),
          new Artwork("a2", "The Great Wave", "Katsushika Hokusai", 1831, "Print", "The Met", "On view"),
          new Artwork("a3", "Melencolia I", "Albrecht Dürer", 1514, "Print", "SMK", "In store"),
          new Artwork("a4", "The Two Fridas", "Frida Kahlo", 1939, "Painting", "Cleveland", "On view"),
          new Artwork("a5", "Haystacks", "Claude Monet", 1891, "Painting", "SMK", "On view"),
          new Artwork("a6", "Fine Wind, Clear Morning", "Katsushika Hokusai", 1832, "Print", "Cleveland", "In conservation"),
          new Artwork("a7", "Young Hare", "Albrecht Dürer", 1502, "Drawing", "The Met", "In store"));

  @GetMapping("/explorer-api/artists")
  public Map<String, Object> artists(@RequestParam(defaultValue = "") String search) {
    return paged(ARTISTS.stream().filter(a -> matches(a.name() + " " + a.nationality(), search)).toList());
  }

  @GetMapping("/explorer-api/artworks")
  public Map<String, Object> artworks(@RequestParam(defaultValue = "") String search) {
    return paged(
        ARTWORKS.stream()
            .filter(a -> matches(a.title() + " " + a.artist() + " " + a.classification() + " " + a.museum(), search))
            .toList());
  }

  public static Optional<Artist> artist(String id) {
    return ARTISTS.stream().filter(a -> a.id().equals(id)).findFirst();
  }

  private static boolean matches(String text, String search) {
    return search.isBlank() || text.toLowerCase().contains(search.toLowerCase());
  }

  private static Map<String, Object> paged(List<?> rows) {
    return Map.of("content", rows, "totalElements", rows.size());
  }
}
