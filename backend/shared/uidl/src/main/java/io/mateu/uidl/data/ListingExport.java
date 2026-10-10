package io.mateu.uidl.data;

import java.util.List;

/**
 * What Mateu hands a {@link io.mateu.uidl.interfaces.ListingExporter}: everything the Export button
 * decided, so the exporter only has to write the file.
 *
 * @param format the format the user asked for
 * @param title the listing's title ({@code @Title} / {@code TitleSupplier}), or null
 * @param columns the exported columns, in order — the visible row fields, labelled like the grid
 * @param rows the WHOLE filtered result set (same search text, filters and criteria as the
 *     on-screen listing, not just the current page); read a cell with {@link
 *     ExportColumn#valueOf(Object)} / {@link ExportColumn#textOf(Object)}
 * @param search the search those rows answer (search text, filters, criteria) — e.g. to print the
 *     applied filters in a report header
 */
public record ListingExport(
    ExportFormat format,
    String title,
    List<ExportColumn> columns,
    List<?> rows,
    SearchRequest search) {}
