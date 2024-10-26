package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TabsForm {

  @Tab("Tab 1")
  @Section("Basic")
  @NotEmpty
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  @Tab("Tab 2")
  @NotNull private int age = 15;

  private double balance = 20.31;

  @NoTab
  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action(order = 0)
  public void throwsException() throws Exception {
    throw new Exception("This is the description of teh exception ;)");
  }

  @Action(order = 1)
  public void slowAction() throws InterruptedException {
    Thread.sleep(5000);
    assessment = "run";
  }

  @Action(order = 2)
  public void assess() {
    assessment = "" + name + ", " + age + ", " + balance + ", " + withPlaceholder;
  }


  public String toString() {
    return "This is a sample form (toString)";
  }

}
