package io.mateu.remote.sampleui;

import io.mateu.mdd.shared.annotations.Action;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyUi {

  private String name = "Mateu";

  private int age;

  private String assessment;

  @Action
  public void assess() {
    assessment = "" + name + ", " + age;
  }

  public String toString() {
    return "This is a sample form";
  }
}
