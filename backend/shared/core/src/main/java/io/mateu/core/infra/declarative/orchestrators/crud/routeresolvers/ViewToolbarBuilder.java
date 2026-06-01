package io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.util.ArrayList;
import java.util.List;

final class ViewToolbarBuilder {

  static List<UserTrigger> createViewToolbar(Object item, CrudOrchestrator orchestrator) {
    var toolbar = new ArrayList<UserTrigger>();
    getAllMethods(orchestrator.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
        .forEach(
            method ->
                toolbar.add(
                    new Button(
                        toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName())));
    var entity = item;
    if (entity instanceof AutoNamedView<?> autoNamedView) {
      entity = autoNamedView.entity();
    }
    getAllMethods(entity.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method ->
                toolbar.add(
                    new Button(
                        toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName())));
    if (!orchestrator.getClass().isAnnotationPresent(SplitCrud.class)) {
        toolbar.add(new Button("Back to list", "cancel-view"));
    }
    if (!readOnly(item, orchestrator)) {
      toolbar.add(new Button("Add another", "new"));
      toolbar.add(new Button("Edit", "edit"));
    }
    return toolbar;
  }

  private static boolean readOnly(Object item, CrudOrchestrator orchestrator) {
    if (orchestrator.readOnly()) return true;
    if (orchestrator.viewClass().isAnnotationPresent(io.mateu.uidl.annotations.ReadOnly.class))
      return true;
    if (item instanceof ModelSupplier modelSupplier) {
      return modelSupplier
          .model()
          .getClass()
          .isAnnotationPresent(io.mateu.uidl.annotations.ReadOnly.class);
    }
    return false;
  }

  private ViewToolbarBuilder() {}
}
