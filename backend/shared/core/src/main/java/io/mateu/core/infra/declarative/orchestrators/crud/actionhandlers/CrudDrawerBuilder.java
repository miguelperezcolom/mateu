package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.CrudFormComponentBuilder;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Builds the create/edit {@link Drawer} for {@link Crud#editInDrawer()} mode: the same form page
 * the /new — /{id}/edit routes would render, wrapped in a drawer sliding over the listing. The
 * form's buttons ("create"/"save", "cancel-new"/"cancel-edit") bubble to the crud mediator exactly
 * like on the routed pages, so the persist/cancel handlers run unchanged — they only differ in
 * drawer mode by closing the overlay instead of navigating.
 */
final class CrudDrawerBuilder {

  static Drawer build(
      boolean isCreation, String headerTitle, Object editor, Crud orchestrator, HttpRequest rq) {
    // On the routed /new — /{id}/edit pages the form values travel as a State fragment; the
    // drawer instead seeds them through Drawer.initialData (the mateu-drawer element adopts it
    // as its state), so the editor's fields arrive populated.
    var model = editor instanceof AutoNamedView autoNamedView ? autoNamedView.entity() : editor;
    return Drawer.builder()
        .id("crud-edit-drawer")
        .headerTitle(headerTitle)
        .width(orchestrator.editDrawerWidth())
        .content(CrudFormComponentBuilder.build(isCreation, rq, editor, orchestrator))
        .initialData(FormViewModel.toMap(model))
        .build();
  }

  private CrudDrawerBuilder() {}
}
