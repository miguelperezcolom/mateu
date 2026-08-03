package io.mateu.sample1;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Content shown inside the overlay fixtures. Deliberately holds several focusable controls, so a
 * test can Tab through them and assert the focus cycles WITHIN the panel instead of escaping to
 * the page behind it.
 */
public class OverlayContentForm implements ComponentTreeSupplier, ActionHandler {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .title("")
        .content(
            List.of(
                text("first", "First"),
                text("second", "Second"),
                Button.builder().label("Confirm").actionId("confirm-overlay").build()))
        .build();
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    // Closing returns the focus to whatever opened the overlay — the behaviour under test.
    return UICommand.closeModal();
  }

  @Override
  public List<String> supportedActions() {
    return List.of("confirm-overlay");
  }

  private static FormField text(String id, String label) {
    return FormField.builder().id(id).label(label).dataType(FieldDataType.string).build();
  }
}
