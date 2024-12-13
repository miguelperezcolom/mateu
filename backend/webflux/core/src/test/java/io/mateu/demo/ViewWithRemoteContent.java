package io.mateu.demo;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.data.RemoteJourney;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/viewwithremotecontent")
@Getter
@Setter
public class ViewWithRemoteContent {

  SimpleForm simpleForm;

  RemoteJourney anotherSimpleForm =
      new RemoteJourney(
          "/mateu/v3",
          "com.example.demo.infra.ui.DemoApp",
          "forms_fields_usualFields_basicFields",
          "");
}
