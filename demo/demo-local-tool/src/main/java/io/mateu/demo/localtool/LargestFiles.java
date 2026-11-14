package io.mateu.demo.localtool;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import jakarta.inject.Inject;

/** "du with a UI": the biggest files under the tool's folder, searchable by path. */
@Title("Largest files")
public class LargestFiles implements Listing<LargestFiles.Row>, Searchable, SubtitleSupplier {

  /** Stops a walk of a huge tree (a home folder) from taking forever. */
  static final int MAX_FILES = 200_000;

  @Inject ToolFolder folder;

  public record Row(
      @Label("File") String path,
      @Label("Size") @ColumnWidth("auto") String size,
      @Label("Bytes") @ColumnWidth("auto") long bytes,
      @Label("Modified") @ColumnWidth("auto") LocalDateTime modified) {}

  @Override
  public String subtitle() {
    return "Under " + folder.path();
  }

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var words = request.searchText().toLowerCase(Locale.ROOT).trim();
    var rows = new ArrayList<Row>();
    walk(folder.path(), rows, words);

    Comparator<Row> order = Comparator.comparingLong(Row::bytes).reversed(); // biggest first
    var sort = request.pageable() == null ? List.<io.mateu.uidl.data.Sort>of() : request.pageable().sort();
    if (sort != null && !sort.isEmpty()) {
      var s = sort.get(0);
      Comparator<Row> by =
          switch (s.field()) {
            case "path" -> Comparator.comparing(Row::path);
            case "modified" -> Comparator.comparing(Row::modified);
            default -> Comparator.comparingLong(Row::bytes);
          };
      order = s.direction() == Direction.descending ? by.reversed() : by;
    }
    rows.sort(order);

    int size = request.pageable() == null || request.pageable().size() <= 0 ? 20 : request.pageable().size();
    int page = request.pageable() == null ? 0 : Math.max(0, request.pageable().page());
    int from = Math.min(rows.size(), page * size);
    int to = Math.min(rows.size(), from + size);
    return new ListingData<>(
        new Page<>("", size, page, rows.size(), List.copyOf(rows.subList(from, to))),
        "No files here");
  }

  static void walk(Path root, List<Row> rows, String words) {
    try {
      Files.walkFileTree(
          root,
          new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
              if (!attrs.isRegularFile()) {
                return FileVisitResult.CONTINUE;
              }
              var relative = root.relativize(file).toString();
              if (words.isEmpty() || relative.toLowerCase(Locale.ROOT).contains(words)) {
                rows.add(
                    new Row(
                        relative,
                        human(attrs.size()),
                        attrs.size(),
                        LocalDateTime.ofInstant(
                            attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault())));
              }
              return rows.size() >= MAX_FILES
                  ? FileVisitResult.TERMINATE
                  : FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFileFailed(Path file, IOException e) {
              return FileVisitResult.CONTINUE; // unreadable: skip it, like du does
            }
          });
    } catch (IOException ignored) {
      // the folder vanished: an empty listing says so
    }
  }

  static String human(long bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }
    var units = "KMGTPE";
    int unit = (int) (Math.log(bytes) / Math.log(1024));
    return String.format(Locale.ROOT, "%.1f %sB", bytes / Math.pow(1024, unit), units.charAt(unit - 1));
  }
}
