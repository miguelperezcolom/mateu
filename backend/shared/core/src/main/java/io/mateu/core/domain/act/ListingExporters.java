package io.mateu.core.domain.act;

import io.mateu.core.infra.DefaultCsvExporter;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.ListingExporter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Which {@link ListingExporter}s the application registered, and the Export buttons a listing gets
 * for them. A button is offered only when the listing opts in AND an exporter writes that format —
 * Mateu ships no spreadsheet / PDF engine, so without the application's exporter there is no button
 * (never a button that fails).
 */
public final class ListingExporters {

  private ListingExporters() {}

  /**
   * The exporter for {@code format}: the application's when it registered one, else core's built-in
   * (CSV only).
   */
  public static Optional<ListingExporter> forFormat(
      ExportFormat format, Collection<? extends ListingExporter> exporters) {
    if (exporters == null) return Optional.empty();
    ListingExporter builtIn = null;
    for (var exporter : exporters) {
      if (exporter == null || exporter.format() != format) continue;
      if (exporter instanceof DefaultCsvExporter) {
        builtIn = exporter;
      } else {
        return Optional.of(exporter);
      }
    }
    return Optional.ofNullable(builtIn);
  }

  /** The formats some registered exporter writes. */
  public static Set<ExportFormat> formats(Collection<? extends ListingExporter> exporters) {
    var formats = EnumSet.noneOf(ExportFormat.class);
    if (exporters != null) {
      for (var exporter : exporters) {
        if (exporter != null && exporter.format() != null) formats.add(exporter.format());
      }
    }
    return formats;
  }

  /** Whether the listing opted into {@code format} ({@code csvExportable()} & co). */
  public static boolean offers(Listing<?> listing, ExportFormat format) {
    return switch (format) {
      case csv -> listing.csvExportable();
      case excel -> listing.excelExportable();
      case pdf -> listing.pdfExportable();
    };
  }

  /** The Export buttons of {@code listing}, in CSV / Excel / PDF order. */
  public static List<Button> exportButtons(Listing<?> listing, Set<ExportFormat> available) {
    var buttons = new ArrayList<Button>();
    for (var format : ExportFormat.values()) {
      if (offers(listing, format) && available.contains(format)) {
        buttons.add(new Button(format.buttonLabel(), format.actionId()));
      }
    }
    return buttons;
  }
}
