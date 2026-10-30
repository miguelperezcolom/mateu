package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.FormTemplate;

/**
 * Redwood's Data management page template (Spectra {@code oj-sp-data-management-page}): a data set
 * to review and manage — a table, a grid, a Gantt — with panels docked beside it ({@code end}, the
 * template's {@code innerEnd}) and below it ({@code bottom}, its {@code innerBottom}), each a
 * {@link DockedPanel} shown when {@code open}. The {@link io.mateu.uidl.fluent.Form} that carries
 * it gives the rest: its title heads the page, its toolbar's buttons sit over the data, and its
 * {@code content} is the data view.
 */
@Experimental("page templates (3.0 beta)")
public record DataManagementPage(DockedPanel end, DockedPanel bottom) implements FormTemplate {}
