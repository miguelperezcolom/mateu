package io.mateu.demo;

import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.Message;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/anothersimpleform")
@Getter
@Setter
public class AnotherSimpleForm implements Form {

  String name = "Antonia";

  int age = 47;

  @MainAction(target = ActionTarget.Component)
  public Message submit() {
    // send the email
    return new Message(
        ResultType.Success,
        "Form submitted",
        "You entered " + name + ", " + age + " before submitting.",
        5000);
  }
}
