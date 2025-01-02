package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.uidl.annotations.FormColumns;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.interfaces.MicroFrontend;

@FormColumns(2)
public class FormOthersSubmenu {

  @MenuOption
  private String justAnString = "Hello World!";

  @MenuOption private FailingForm failingForm;

  @MenuOption private MicroFrontend remoteForm = new MicroFrontend(
          "",
          "{\"nombre\":\"Mateu\",\"age\":16}"
  );

  @MenuOption private BackgroundOnTop backgroundOnTop;

  @MenuOption private TabsForm tabs;

  @MenuOption private HasInitMethodForm hasInitMethod;

  @MenuOption private MessagesForm messages;

  @MenuOption private ModalsForm modals;

  @MenuOption private NestedDropdownsForm nestedDropdowns;

  @MenuOption private MyReadOnlyPojo readOnlyPojo;

  @MenuOption private MyReadOnlyPojoWithCrud readOnlyPojoWithCrud;

  @MenuOption private WizardPage1 wizard;

  @MenuOption private DecomposedForm decomposed;

  @MenuOption private FormStructureForm formStructure;
}
