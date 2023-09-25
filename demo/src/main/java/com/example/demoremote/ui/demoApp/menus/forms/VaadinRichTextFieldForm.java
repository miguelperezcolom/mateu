package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

@Data
public class VaadinRichTextFieldForm {

  @Section("Important!!!")
  @RawContent
  String warning =
      "Please notice the rich text editor from Vaadin is subject to a commercial paid license."
          + " It is included in Mateu for demo purposes only. Do not use it in your code unless you have an agreement with Vaadin.";

  // @NotEmpty
  @RichText(component = RichTextComponent.Vaadin)
  // @Placeholder("This should appear as the placeholder")
  private String text = "Hello <b>Mateu</b>.";

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + text;
  }

  public String toString() {
    return "Text";
  }
}
