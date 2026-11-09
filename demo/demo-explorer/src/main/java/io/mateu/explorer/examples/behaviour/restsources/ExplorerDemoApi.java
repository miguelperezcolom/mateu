package io.mateu.explorer.examples.behaviour.restsources;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * A small REST API the data examples consume — local, so the Explorer works offline. It is plain
 * Spring, nothing Mateu: the screens reach it through the source catalogue (sources.yaml).
 */
@RestController
@RequestMapping("/explorer-api/behaviour")
public class ExplorerDemoApi {

  /** The key the proxied source must present; the server resolves ${secret.DEMO} to it. */
  static String demoKey() {
    var fromEnv = System.getenv("MATEU_SECRET_DEMO");
    return fromEnv == null || fromEnv.isBlank() ? DemoSecrets.DEFAULT_DEMO_KEY : fromEnv;
  }

  static final List<Map<String, Object>> PLANETS =
      List.of(
          planet(1, "Tatooine", "arid", 200000),
          planet(2, "Alderaan", "temperate", 2000000000),
          planet(3, "Hoth", "frozen", 0),
          planet(4, "Dagobah", "murky", 0),
          planet(5, "Bespin", "temperate", 6000000),
          planet(6, "Endor", "temperate", 30000000),
          planet(7, "Naboo", "temperate", 4500000),
          planet(8, "Kamino", "temperate", 1000000000));

  private static Map<String, Object> planet(int id, String name, String climate, long population) {
    var p = new LinkedHashMap<String, Object>();
    p.put("id", id);
    p.put("name", name);
    p.put("climate", climate);
    p.put("population", Map.of("value", population)); // nested: read with `fields:` in the catalogue
    return p;
  }

  /** A paged envelope: {items, total}. */
  @GetMapping("/planets")
  Map<String, Object> planets(
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "5") int size) {
    var text = search.toLowerCase(Locale.ROOT);
    var matches =
        PLANETS.stream()
            .filter(p -> ((String) p.get("name")).toLowerCase(Locale.ROOT).contains(text))
            .toList();
    var from = Math.min(page * size, matches.size());
    var to = Math.min(from + size, matches.size());
    return Map.of("items", matches.subList(from, to), "total", matches.size());
  }

  @GetMapping("/planets/{id}")
  ResponseEntity<Map<String, Object>> planet(@PathVariable int id) {
    return PLANETS.stream()
        .filter(p -> p.get("id").equals(id))
        .findFirst()
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // ── writes ────────────────────────────────────────────────────────────────

  private static final List<Map<String, Object>> NOTES = Collections.synchronizedList(new ArrayList<>());
  private static final AtomicInteger NEXT = new AtomicInteger(1);

  @GetMapping("/notes")
  Map<String, Object> notes() {
    return Map.of("items", List.copyOf(NOTES));
  }

  @PostMapping("/notes")
  Map<String, Object> addNote(@RequestBody Map<String, Object> body) {
    var note = new LinkedHashMap<String, Object>();
    note.put("id", NEXT.getAndIncrement());
    note.put("text", body.getOrDefault("text", ""));
    note.put("at", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
    NOTES.add(0, note);
    // `resultPath: saved` merges this object into the page state
    return Map.of("saved", Map.of("lastNote", "#" + note.get("id") + " at " + note.get("at")));
  }

  @GetMapping("/ping")
  Map<String, Object> ping() {
    var at = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    return Map.of("result", Map.of("lastPong", "pong at " + at));
  }

  // ── a protected endpoint: needs the API key the proxy injects ──────────────

  @GetMapping("/vault")
  ResponseEntity<Map<String, Object>> vault(
      @RequestHeader(value = "X-Api-Key", required = false) String key) {
    if (!demoKey().equals(key)) {
      return ResponseEntity.status(401).body(Map.of("message", "Missing or wrong X-Api-Key"));
    }
    return ResponseEntity.ok(
        Map.of("items", List.of(Map.of("secretThing", "The vault opened: the key matched"))));
  }

  // ── where an endpoint lives (the environment overlay re-points this) ─────

  @GetMapping("/where/authored")
  Map<String, Object> whereAuthored() {
    return Map.of("items", List.of(Map.of("servedBy", "the url authored in sources.yaml")));
  }

  @GetMapping("/where/pre")
  Map<String, Object> wherePre() {
    return Map.of(
        "items", List.of(Map.of("servedBy", "the url of the explorer-pre environment overlay")));
  }
}
