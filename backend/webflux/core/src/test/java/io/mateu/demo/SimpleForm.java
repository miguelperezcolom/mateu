package io.mateu.demo;

import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.Message;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/simpleform")
@Getter
@Setter
public class SimpleForm implements Form {

  String name = "Mateu";

  int age = 16;

  @MainAction
  public Message submit() {
    // send the email
    return new Message(
        ResultType.Success,
        "Form submitted",
        "You entered " + name + ", " + age + " before submitting.",
        5000);
  }
}
