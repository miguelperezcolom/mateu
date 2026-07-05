package io.mateu.mdd.demoadminpanel.infra.in.ui.drawer;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * The form shown inside the drawer. Server-side and interactive: saving persists the contact and
 * closes the drawer emitting "contact-saved" with the edited values, so the host page refreshes
 * itself via {@code @SubscribeTo}; cancelling just closes.
 */
public class ContactEditDrawerForm implements ComponentTreeSupplier, ActionHandler {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .title("")
        .content(
            List.of(
                text("nombre", "Nombre", ContactHolder.nombre),
                text("email", "Email", ContactHolder.email),
                Button.builder().label("Guardar").actionId("save-contact").build(),
                Button.builder().label("Cancelar").actionId("cancel-contact").build()))
        .build();
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("save-contact".equals(actionId)) {
      var edited = httpRequest.getComponentState(ContactData.class);
      ContactHolder.nombre = edited.nombre;
      ContactHolder.email = edited.email;
      return List.of(
          Message.success("Contacto guardado"),
          // Close the drawer AND notify the host page, which reloads via @SubscribeTo.
          UICommand.closeModal(
              "contact-saved", Map.of("nombre", edited.nombre, "email", edited.email)));
    }
    if ("cancel-contact".equals(actionId)) {
      return UICommand.closeModal();
    }
    return null;
  }

  private static FormField text(String id, String label, String value) {
    return FormField.builder()
        .id(id)
        .label(label)
        .dataType(FieldDataType.string)
        .initialValue(value)
        .build();
  }
}
