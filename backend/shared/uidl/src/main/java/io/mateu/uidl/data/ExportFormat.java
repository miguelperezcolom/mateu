package io.mateu.uidl.data;

/**
 * A file format a listing can be exported to. Each one has its own toolbar button — shown when the
 * listing opts in ({@code csvExportable()} / {@code excelExportable()} / {@code pdfExportable()})
 * AND a {@link io.mateu.uidl.interfaces.ListingExporter} for the format is registered — and its own
 * action id.
 */
public enum ExportFormat {
  csv("Export CSV", "export.csv", "text/csv"),
  excel(
      "Export Excel",
      "export.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
  pdf("Export PDF", "export.pdf", "application/pdf");

  private final String buttonLabel;
  private final String defaultFilename;
  private final String defaultMediaType;

  ExportFormat(String buttonLabel, String defaultFilename, String defaultMediaType) {
    this.buttonLabel = buttonLabel;
    this.defaultFilename = defaultFilename;
    this.defaultMediaType = defaultMediaType;
  }

  /** The action id the toolbar button dispatches: {@code export-csv|export-excel|export-pdf}. */
  public String actionId() {
    return "export-" + name();
  }

  /** The label of the toolbar button. */
  public String buttonLabel() {
    return buttonLabel;
  }

  /** The filename used when the exporter answers none. */
  public String defaultFilename() {
    return defaultFilename;
  }

  /** The media type used when the exporter answers none. */
  public String defaultMediaType() {
    return defaultMediaType;
  }

  /** The format an action id names ({@code export-excel} → {@link #excel}), or null. */
  public static ExportFormat ofActionId(String actionId) {
    if (actionId == null || !actionId.startsWith("export-")) return null;
    for (var format : values()) {
      if (format.actionId().equals(actionId)) return format;
    }
    return null;
  }
}
