package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.CrudFormComponentBuilder;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Builds the create/edit {@link Drawer} for {@link Crud#editInDrawer()} mode: the same form page
 * the /new — /{id}/edit routes would render, wrapped in a drawer sliding over the listing. The
 * form's buttons ("create"/"save", "cancel-new"/"cancel-edit") bubble to the crud mediator exactly
 * like on the routed pages, so the persist/cancel handlers run unchanged — they only differ in
 * drawer mode by closing the overlay instead of navigating.
 *
 * <p>The drawer always carries the same id ({@link #DRAWER_ID}): re-sending it while it is open
 * refreshes it in place (the "same Drawer.id" contract of the Add fragment), which is how "Save and
 * next" moves it on to the next record and how a failed save shows its error banner.
 */
final class CrudDrawerBuilder {

  static final String DRAWER_ID = "crud-edit-drawer";

  static Drawer build(
      boolean isCreation, String headerTitle, Object editor, Crud orchestrator, HttpRequest rq) {
    // On the routed /new — /{id}/edit pages the form values travel as a State fragment; the
    // drawer instead seeds them through Drawer.initialData (the mateu-drawer element adopts it
    // as its state), so the editor's fields arrive populated.
    return build(
        isCreation, headerTitle, editor, orchestrator, rq, FormViewModel.toMap(editor), null);
  }

  /**
   * The drawer with explicit values and, when {@code errorMessage} is set, an error banner on top
   * of the form (the Redwood create-edit-drawer {@code displayErrorMessageBanner}).
   */
  static Drawer build(
      boolean isCreation,
      String headerTitle,
      Object editor,
      Crud orchestrator,
      HttpRequest rq,
      Map<String, Object> initialData,
      String errorMessage) {
    Component form = CrudFormComponentBuilder.build(isCreation, rq, editor, orchestrator, true);
    Component content =
        errorMessage == null
            ? form
            : VerticalLayout.builder()
                .style("width: 100%;")
                .content(
                    List.of(
                        Notice.builder()
                            .id("crud-drawer-error")
                            .text(errorMessage)
                            .theme("danger")
                            .fullWidth(true)
                            .content(List.of())
                            .build(),
                        form))
                .build();
    return Drawer.builder()
        .id(DRAWER_ID)
        .headerTitle(headerTitle)
        .width(orchestrator.editDrawerWidth())
        .content(content)
        .initialData(initialData)
        .build();
  }

  private CrudDrawerBuilder() {}
}
