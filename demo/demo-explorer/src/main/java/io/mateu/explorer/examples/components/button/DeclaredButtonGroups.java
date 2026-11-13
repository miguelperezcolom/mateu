package io.mateu.explorer.examples.components.button;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Message;

/**
 * Button groups DECLARED on a page: {@code @Toolbar} methods sharing a {@code group} collapse into
 * one dropdown in the page header, labelled with the group's name. Mark one member {@code
 * groupPrimary = true} and the group becomes a SPLIT button instead: that method runs from the
 * button, the others are behind its ▾. {@code order} fixes the sequence (reflection does not keep
 * the declaration order). The same {@code group}/{@code groupPrimary} work on {@code @Button}, for
 * the buttons below a form.
 */
@Title("Declared button groups")
public class DeclaredButtonGroups {

  public String name = "Order 42";

  @Toolbar(group = "save", groupPrimary = true, buttonStyle = ButtonStyle.primary, order = 1)
  public Message save() {
    return Message.success("Saved " + name);
  }

  @Toolbar(group = "save", order = 2)
  @Label("Save as draft")
  public Message saveAsDraft() {
    return Message.success("Saved " + name + " as a draft");
  }

  @Toolbar(group = "export", order = 3)
  @Label("CSV")
  public Message exportCsv() {
    return Message.success("Exported " + name + " to CSV");
  }

  @Toolbar(group = "export", order = 4)
  @Label("PDF")
  public Message exportPdf() {
    return Message.success("Exported " + name + " to PDF");
  }
}
