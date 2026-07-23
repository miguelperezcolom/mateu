package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Explorer demo: a button that opens a Mateu Dialog (overlay) under the redwood-spectra shell. */
@UI("/dialog-demo")
@Title("Dialog")
public class DialogDemo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Text.builder().text("A Mateu Dialog rendered inside the authentic Spectra shell.").build(),
                Button.builder().label("Open dialog").actionId("openDialog").build()))
        .build();
  }

  @Action
  Object openDialog() {
    return Dialog.builder()
        .headerTitle("Booking 204")
        .content(
            Text.builder()
                .text("Confirmation ABC-123 · Deluxe room · 3 nights · Balance 12.480,50 €.")
                .build())
        .build();
  }
}
