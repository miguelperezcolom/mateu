package io.mateu.e2e.figma;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the screens converted from the Figma sample file (specs/ui, added with -Dloader.path) and
 * the small API they read and write, so the check runs offline: the artworks listing and record
 * (sources.yaml) and the contact form's Save (actions.yaml). {@code GET /api/contacts} lets the
 * test see what Save sent.
 */
@SpringBootApplication
@RestController
public class Application {

  static final List<Map<String, Object>> ARTWORKS =
      List.of(
          artwork("1", "The Starry Night", "Vincent van Gogh", 1889, "MoMA, New York", "Oil on canvas", "73.7 × 92.1 cm"),
          artwork("2", "The Kiss", "Gustav Klimt", 1908, "Belvedere, Vienna", "Oil and gold leaf on canvas", "180 × 180 cm"),
          artwork("3", "Las Meninas", "Diego Velázquez", 1656, "Museo del Prado, Madrid", "Oil on canvas", "318 × 276 cm"));

  final List<Map<String, Object>> contacts = new CopyOnWriteArrayList<>();

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

  static Map<String, Object> artwork(String id, String title, String artist, int year, String location, String medium, String dimensions) {
    return Map.of("id", id, "title", title, "artist", artist, "year", year, "location", location, "medium", medium, "dimensions", dimensions);
  }

  @GetMapping("/api/artworks")
  public Map<String, Object> artworks(@RequestParam(defaultValue = "") String search) {
    var needle = search.toLowerCase();
    var rows = new ArrayList<Map<String, Object>>();
    for (var a : ARTWORKS) {
      if (needle.isBlank() || (a.get("title") + " " + a.get("artist")).toLowerCase().contains(needle)) rows.add(a);
    }
    return Map.of("content", rows, "totalElements", rows.size());
  }

  @GetMapping("/api/artworks/{id}")
  public ResponseEntity<Map<String, Object>> artwork(@PathVariable String id) {
    return ARTWORKS.stream().filter(a -> a.get("id").equals(id)).findFirst()
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/api/contacts")
  public Map<String, Object> saveContact(@RequestBody Map<String, Object> contact) {
    contacts.add(contact);
    return Map.of("id", contacts.size(), "saved", true);
  }

  @GetMapping("/api/contacts")
  public List<Map<String, Object>> contacts() {
    return contacts;
  }
}
