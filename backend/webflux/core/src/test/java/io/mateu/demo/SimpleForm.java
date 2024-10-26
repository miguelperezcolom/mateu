package io.mateu.demo;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Message;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MateuUI;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.Form;
import io.mateu.dtos.ResultType;
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
