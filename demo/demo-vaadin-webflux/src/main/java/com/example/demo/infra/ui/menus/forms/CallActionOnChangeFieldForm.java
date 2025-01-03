package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Title("Call action on change")
public class CallActionOnChangeFieldForm {

  @Section("Basic")
  @NotBlank
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  @CallActionOnChange("assess")
  private int age = 15;

  @CallActionOnChange("assess")
  private double balance = 20.31;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + name + ", " + age + ", " + balance;
  }
}
