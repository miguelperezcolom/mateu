package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class TextFieldsForm {

  @Section(value = "Basic", columns = 2)
  @NotEmpty
  private String name = "Mateu";

  @Password
  private String password;

  @TextArea
  @Colspan(2)
  private String text =
      """
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.

            Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.
            """;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + "" + name + "" + password + ", " + text;
  }

  public String toString() {
    return "Text";
  }
}
