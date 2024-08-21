package io.mateu.demo;

import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import io.mateu.core.domain.uidefinition.shared.interfaces.Form;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/anothersimpleform")
@Getter
@Setter
public class AnotherSimpleForm implements Form {

  String name = "Antonia";

  int age = 47;

  @MainAction
  public Message submit() {
    // send the email
    return new Message(
        ResultType.Success,
        "Form submitted",
        "You entered " + name + ", " + age + " before submitting.");
  }
}
