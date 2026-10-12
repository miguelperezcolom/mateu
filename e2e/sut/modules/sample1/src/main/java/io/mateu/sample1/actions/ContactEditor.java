package io.mateu.sample1.actions;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/** The drawer's content: saves by closing WITH a result, and can open a dialog over itself. */
public class ContactEditor implements ComponentTreeSupplier {

  String contactName = "";

  @Override
  public Component component(HttpRequest httpRequest) {
    return new VerticalLayout(
        FormField.builder()
            .id("contactName")
            .label("Contact name")
            .dataType(FieldDataType.string)
            .build(),
        new HorizontalLayout(
            new Button(
                "Save contact",
                () -> UICommand.closeModal("contact-saved", Map.of("name", contactName))),
            new Button(
                "Open nested dialog",
                () ->
                    Dialog.builder()
                        .headerTitle("Nested dialog")
                        .closeButtonOnHeader(true)
                        .content(new NestedDialogContent())
                        .build())));
  }

  /** Inside the nested dialog: closing it must leave the drawer under it open. */
  public static class NestedDialogContent implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          new Text("Inner dialog"), new Button("Close inner", () -> UICommand.closeModal()));
    }
  }
}
