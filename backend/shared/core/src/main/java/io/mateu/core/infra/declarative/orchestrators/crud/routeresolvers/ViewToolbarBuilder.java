package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.NotEditable;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.ToolbarButtons;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.ArrayList;
import java.util.List;

final class ViewToolbarBuilder {

  static List<UserTrigger> createViewToolbar(
      Object item, Crud orchestrator, HttpRequest httpRequest) {
    var toolbar = new ArrayList<UserTrigger>();
    // @ViewToolbarButton says WHICH toolbar; an @Toolbar on the same method says how it looks —
    // the same composition the listing toolbar uses (see ToolbarButtons).
    getAllMethods(orchestrator.behaviourSource().getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, ViewToolbarButton.class))
        .filter(method -> io.mateu.core.domain.Authorizer.isVisible(method, httpRequest))
        .sorted(
            java.util.Comparator.comparingInt(
                method -> ToolbarButtons.orderOf(MetaAnnotations.find(method, Toolbar.class))))
        .forEach(
            method ->
                toolbar.add(
                    ToolbarButtons.toolbarButton(
                        "action-on-view-" + method.getName(),
                        getLabel(method),
                        MetaAnnotations.find(method, Toolbar.class))));
    final var finalEntity = item;
    getAllMethods(finalEntity.getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, Toolbar.class))
        .filter(
            method ->
                !MetaAnnotations.isPresent(method, Hidden.class)
                    || !MetaAnnotations.find(method, Hidden.class).value().isEmpty())
        .filter(
            method ->
                !(finalEntity instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .filter(method -> io.mateu.core.domain.Authorizer.isVisible(method, httpRequest))
        .forEach(
            method ->
                toolbar.add(
                    ToolbarButtons.toolbarButton(
                        method.getName(),
                        getLabel(method),
                        MetaAnnotations.find(method, Toolbar.class))));
    if (!MetaAnnotations.isPresent(orchestrator.getClass(), SplitCrud.class)) {
      toolbar.add(new Button(orchestrator.backToListLabel(), "cancel-view"));
    }
    // No "Add another" here: the view of an EXISTING record is not the place to start another one
    // (the listing's New is). It belongs to the create flow — the toast a successful create answers
    // with offers it (PersistActionHandler). Only what the crud can do: a listing that is only
    // Navigable has no editor, and offering it led to a route nothing serves.
    if (!viewReadOnly(item, orchestrator)
        && orchestrator.canEdit()
        && !hiddenByEntity(finalEntity, "edit", httpRequest)) {
      toolbar.add(new Button(orchestrator.editLabel(), "edit"));
    }
    return toolbar;
  }

  /**
   * Lets the viewed entity hide a built-in view action ({@code "new"} / {@code "edit"}) per
   * instance state by implementing {@link VisibilitySupplier} — same mechanism already used for its
   * {@link Toolbar} buttons.
   */
  private static boolean hiddenByEntity(Object entity, String action, HttpRequest httpRequest) {
    return entity instanceof VisibilitySupplier vs && vs.isHidden(action, httpRequest);
  }

  private static boolean viewReadOnly(Object item, Crud orchestrator) {
    if (orchestrator.readOnly()) return true;
    if (MetaAnnotations.isPresent(orchestrator.getClass(), NotEditable.class)) return true;
    if (MetaAnnotations.isPresent(
        orchestrator.viewClass(), io.mateu.uidl.annotations.ReadOnly.class)) return true;
    if (item != null
        && MetaAnnotations.isPresent(item.getClass(), io.mateu.uidl.annotations.ReadOnly.class))
      return true;
    if (item instanceof ModelSupplier modelSupplier) {
      return MetaAnnotations.isPresent(
          modelSupplier.model().getClass(), io.mateu.uidl.annotations.ReadOnly.class);
    }
    return false;
  }

  private ViewToolbarBuilder() {}
}
