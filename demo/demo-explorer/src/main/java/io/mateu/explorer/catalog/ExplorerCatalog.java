package io.mateu.explorer.catalog;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.yaml.snakeyaml.Yaml;

/**
 * The Explorer's index, read once from the classpath:
 *
 * <ul>
 *   <li>{@code explorer/checklist.yaml} — the areas and groups of the menu (in order) and every id the
 *       Explorer must cover;
 *   <li>{@code explorer/entries/**}{@code /*.yaml} — ONE file per entry, discovered by convention.
 *       Adding an entry never edits a shared file: that is what lets several people (or agents)
 *       add entries in parallel without merge conflicts.
 * </ul>
 *
 * <p>Everything else — the menu, the routes of the entry pages, the global search, the home page's
 * coverage numbers and the coverage test — is derived from these two.
 */
public final class ExplorerCatalog {

  public static final String CHECKLIST = "explorer/checklist.yaml";
  public static final String ENTRIES = "classpath*:explorer/entries/**/*.yaml";

  /** Where the build copies the module's own sources (see the pom): {@code explorer-src/<path>}. */
  public static final String SOURCES = "explorer-src/";

  private static volatile ExplorerCatalog instance;

  private final List<Area> areas;
  private final Map<String, ChecklistItem> items;
  private final Map<String, Entry> entries;

  public record Area(String id, String title, List<Group> groups) {}

  public record Group(String area, String id, String title, List<ChecklistItem> items) {
    public String key() {
      return area + "/" + id;
    }
  }

  public record ChecklistItem(String id, String title, String doc, String note, String group) {}

  private ExplorerCatalog(List<Area> areas, Map<String, ChecklistItem> items, Map<String, Entry> entries) {
    this.areas = areas;
    this.items = items;
    this.entries = entries;
  }

  public static ExplorerCatalog get() {
    if (instance == null) {
      synchronized (ExplorerCatalog.class) {
        if (instance == null) {
          instance = load();
        }
      }
    }
    return instance;
  }

  public List<Area> areas() {
    return areas;
  }

  public Map<String, ChecklistItem> items() {
    return items;
  }

  public Collection<Entry> entries() {
    return entries.values();
  }

  public Optional<Entry> entry(String id) {
    return Optional.ofNullable(entries.get(id));
  }

  /** The entries of a menu group, by title. */
  public List<Entry> entriesOf(String area, String group) {
    return entries.values().stream()
        .filter(e -> area.equals(e.area()) && group.equals(e.group()))
        .sorted(Comparator.comparing(e -> e.title().toLowerCase()))
        .toList();
  }

  public Optional<Area> area(String id) {
    return areas.stream().filter(a -> a.id().equals(id)).findFirst();
  }

  /** The checklist ids no entry covers yet. */
  public List<ChecklistItem> pending() {
    var covered = new java.util.HashSet<String>();
    entries.values().forEach(e -> covered.addAll(e.covers()));
    return items.values().stream().filter(i -> !covered.contains(i.id())).toList();
  }

  /** The text of one of the module's own source files, as the build copied it. */
  public static Optional<String> source(String path) {
    try (InputStream in =
        ExplorerCatalog.class.getClassLoader().getResourceAsStream(SOURCES + path)) {
      return in == null
          ? Optional.empty()
          : Optional.of(new String(in.readAllBytes(), StandardCharsets.UTF_8));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  // ------------------------------------------------------------------------------------------

  @SuppressWarnings("unchecked")
  static ExplorerCatalog load() {
    var cl = ExplorerCatalog.class.getClassLoader();
    Map<String, Object> checklist;
    try (InputStream in = cl.getResourceAsStream(CHECKLIST)) {
      if (in == null) {
        throw new IllegalStateException("Missing classpath:" + CHECKLIST);
      }
      checklist = new Yaml().load(in);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    var groupItems = (Map<String, List<Map<String, Object>>>) checklist.get("groups");
    var items = new LinkedHashMap<String, ChecklistItem>();
    var areas = new ArrayList<Area>();
    for (var a : (List<Map<String, Object>>) checklist.get("areas")) {
      var areaId = str(a.get("id"));
      var groups = new ArrayList<Group>();
      for (var g : (List<Map<String, Object>>) a.get("groups")) {
        var key = areaId + "/" + str(g.get("id"));
        var list = new ArrayList<ChecklistItem>();
        for (var i : groupItems.getOrDefault(key, List.of())) {
          var item =
              new ChecklistItem(
                  str(i.get("id")), str(i.get("title")), str(i.get("doc")), str(i.get("note")), key);
          if (items.put(item.id(), item) != null) {
            throw new IllegalStateException("Checklist id listed twice: " + item.id());
          }
          list.add(item);
        }
        groups.add(new Group(areaId, str(g.get("id")), str(g.get("title")), List.copyOf(list)));
      }
      areas.add(new Area(areaId, str(a.get("title")), List.copyOf(groups)));
    }

    var entries = new LinkedHashMap<String, Entry>();
    try {
      Resource[] resources = new PathMatchingResourcePatternResolver(cl).getResources(ENTRIES);
      for (var resource : resources) {
        try (InputStream in = resource.getInputStream()) {
          Map<String, Object> raw = new Yaml().load(in);
          var entry = Entry.of(raw, resource.getFilename());
          if (entries.put(entry.id(), entry) != null) {
            throw new IllegalStateException("Two entries with id " + entry.id());
          }
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    return new ExplorerCatalog(List.copyOf(areas), items, entries);
  }

  static String str(Object o) {
    return o == null ? null : o.toString();
  }
}
