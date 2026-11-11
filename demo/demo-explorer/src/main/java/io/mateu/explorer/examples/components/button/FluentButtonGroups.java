package io.mateu.explorer.examples.components.button;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Button groups in Java. {@link ButtonGroup#of} is a DROPDOWN (one trigger opening its buttons);
 * {@link ButtonGroup#split} is a SPLIT button: the primary runs from the button itself and the ▾
 * next to it opens the rest. Every button here carries its own handler, so each one answers with a
 * toast.
 */
public class FluentButtonGroups implements ComponentTreeSupplier {

  private static Button button(String label, String actionId, String said) {
    return Button.builder()
        .label(label)
        .actionId(actionId)
        .callable(() -> Message.success(said))
        .build();
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .wrap(true)
        .content(
            List.of(
                ButtonGroup.split(
                    Button.builder()
                        .label("Save")
                        .actionId("save")
                        .buttonStyle(ButtonStyle.primary)
                        .callable(() -> Message.success("Saved"))
                        .build(),
                    button("Save as draft", "saveAsDraft", "Saved as a draft"),
                    button("Save and close", "saveAndClose", "Saved, and closed")),
                ButtonGroup.of(
                    "Export",
                    button("CSV", "exportCsv", "Exported to CSV"),
                    button("Excel", "exportExcel", "Exported to Excel"),
                    button("PDF", "exportPdf", "Exported to PDF"))))
        .build();
  }
}
