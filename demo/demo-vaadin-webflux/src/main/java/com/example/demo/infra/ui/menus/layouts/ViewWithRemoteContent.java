package com.example.demo.infra.ui.menus.layouts;

import com.example.demo.infra.ui.SimpleForm;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Slot;
import io.mateu.uidl.annotations.SlotName;
import io.mateu.uidl.data.RemoteJourney;
import io.mateu.uidl.interfaces.View;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/viewwithremotecontent")
@Getter
@Setter
public class ViewWithRemoteContent implements View {

  @Slot(SlotName.left)
  SimpleForm simpleForm;

  @Slot(SlotName.main)
  RemoteJourney anotherSimpleForm =
          new RemoteJourney(
                  "/mateu/v3",
                  "com.example.demo.infra.ui.DemoApp",
                  "forms_fields_usualFields_basicFields",
                  "");
}
