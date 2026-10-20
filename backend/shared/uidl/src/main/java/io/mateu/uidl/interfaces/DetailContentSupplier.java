package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;

/**
 * Implemented by the object a record is shown with (a CRUD's view class — for an {@code
 * AutoCrud<T>}, {@code T} itself — or an editable view's view) to supply the <b>content</b> of its
 * read-only detail page, instead of the read-only form Mateu draws from its fields.
 *
 * <p>Only the content changes: the page header (title, {@link SubtitleSupplier subtitle}, badges,
 * KPIs) and the toolbar (Back to list, Edit, {@code @Toolbar} / {@code @ViewToolbarButton} buttons)
 * stay the ones Mateu builds, and the editor and the creation form keep their regular forms even
 * when they are the same class.
 *
 * <p>Return any fluent {@link Component} — for instance an {@code ItemOverview} (key-info card +
 * tabs). A {@link ComponentTreeSupplier} is expanded in place, so the buttons it draws reach the
 * page's own handlers (a CRUD's {@code "edit"}, {@code "cancel-view"}, {@code
 * "action-on-view-<method>"} of a {@code @ViewToolbarButton}). Return {@code null} to keep the
 * default read-only form (e.g. only for some records).
 *
 * <pre>{@code
 * public class StudentForm implements Identifiable, DetailContentSupplier {
 *   ...
 *   @Override
 *   public Component detailContent(HttpRequest httpRequest) {
 *     return new StudentOverview(this);
 *   }
 * }
 * }</pre>
 */
public interface DetailContentSupplier {

  Component detailContent(HttpRequest httpRequest);
}
