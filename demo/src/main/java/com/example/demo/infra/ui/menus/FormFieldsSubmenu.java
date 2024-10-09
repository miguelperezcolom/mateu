package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter;

public class FormFieldsSubmenu {

  @Submenu
  FormUsualFieldsSubmenu usualFields;

  @MenuOption private HideFieldForm hideField;

  @MenuOption private DisableFieldForm disableField;

  @MenuOption private SameLineForm sameLine;

  @Submenu
  private CollectionsSubmenu collections;

  @Submenu private RefsSubmenu refs;

  @MenuOption private MiscellaneousForm miscellaneous;

  @MenuOption private WebComponentForm webComponent;

  @MenuOption private ElementForm htmlElement;

}
