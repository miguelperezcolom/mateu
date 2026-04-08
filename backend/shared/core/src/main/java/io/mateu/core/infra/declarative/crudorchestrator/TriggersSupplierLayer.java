package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.util.ArrayList;
import java.util.List;

public abstract class TriggersSupplierLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends ActionSupplierLayer<View, Editor, CreationForm, Filters, Row, IdType>
    implements TriggersSupplier {

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    var triggers = new ArrayList<Trigger>();
    if (!isViewing(httpRequest)) {
      triggers.add(new OnLoadTrigger("search"));
    }
    triggers.add(new OnSuccessTrigger("search", "create", ""));
    triggers.add(new OnSuccessTrigger("search", "delete", ""));
    triggers.add(new OnSuccessTrigger("search", "save", ""));
    triggers.add(new OnSuccessTrigger("search", "cancel-view", ""));
    triggers.add(new OnSuccessTrigger("search", "cancel-create", ""));
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
        .forEach(
            method -> {
              triggers.add(new OnSuccessTrigger("search", "action-on-row-" + method.getName(), ""));
            });
    return triggers;
  }

  public boolean isViewing(HttpRequest httpRequest) {
    var selectedItem = httpRequest.getAttribute("selectedItem");
    if (selectedItem == null) {
      return false;
    }
    if (selectedItem instanceof ModelSupplier modelSupplier) {
      selectedItem = modelSupplier.model();
    }
    return selectedItem.getClass().equals(viewClass());
  }
}
