package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.CrudFormComponentBuilder;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.ServerSideComponent;
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

  /** The id of the drawer's form component (see {@link #formComponent}). */
  static final String FORM_ID = "crud-edit-drawer-form";

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
    // the drawer opens OVER the listing: the address bar stays on the listing. The navigation
    // adjuster had already set it to the record (/{id}, /{id}/edit, /new) for the routed pages,
    // so the url was left on a record after the drawer closed and a reload opened its view page.
    rq.setAttribute("updateUrl", "_no_update");
    Component form = CrudFormComponentBuilder.build(isCreation, rq, editor, orchestrator, true);
    var children = new java.util.ArrayList<Component>();
    if (errorMessage != null) {
      children.add(
          Notice.builder()
              .id("crud-drawer-error")
              .text(errorMessage)
              .theme("danger")
              .fullWidth(true)
              .content(List.of())
              .build());
    }
    children.add(form);
    return Drawer.builder()
        .id(DRAWER_ID)
        .headerTitle(headerTitle)
        .width(orchestrator.editDrawerWidth())
        .content(formComponent(editor, form, children, initialData, rq))
        .initialData(initialData)
        .build();
  }

  /**
   * The drawer's form as a component of its OWN — exactly what the routed {@code /new} and {@code
   * /{id}/edit} pages are: the editor's type, its values, its client-side validations and the
   * form's create/save actions (validated, bubbling to the crud with the form state as {@code
   * initiatorState}). It used to be plain content of the crud component, which declares those
   * actions without validation: a required field left empty was sent, refused by the server and
   * never marked. The error banner lives INSIDE it, so a refused save re-renders the same component
   * in place and the fields it marks invalid ({@link #FORM_ID}) stay marked.
   */
  private static Component formComponent(
      Object editor,
      Component form,
      List<Component> children,
      Map<String, Object> initialData,
      HttpRequest rq) {
    var actions =
        form instanceof io.mateu.uidl.fluent.PageView page && page.actions() != null
            ? page.actions()
            : List.<io.mateu.uidl.fluent.Action>of();
    var route = rq.runActionRq().consumedRoute();
    // the browser names this type back on the form's own actions (a lookup's search…)
    io.mateu.core.application.security.WireTypes.emitted(editor.getClass().getName());
    return ServerSideComponent.builder()
        .id(FORM_ID)
        .serverSideType(editor.getClass().getName())
        .route(route)
        .initialData(initialData)
        .style("width: 100%;")
        .actions(actions)
        .triggers(List.of())
        .rules(List.of())
        .validations(
            io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.createValidations(
                editor, route, rq))
        .children(children)
        .build();
  }

  private CrudDrawerBuilder() {}
}
