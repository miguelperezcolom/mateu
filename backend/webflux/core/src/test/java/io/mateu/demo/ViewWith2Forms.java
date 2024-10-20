package io.mateu.demo;

import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/viewwith2forms")
@Getter
@Setter
public class ViewWith2Forms {

  SimpleForm simpleForm;

  AnotherSimpleForm anotherSimpleForm;
}
