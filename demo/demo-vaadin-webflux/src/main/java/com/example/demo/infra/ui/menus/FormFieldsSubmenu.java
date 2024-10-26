package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Submenu;

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

  @MenuOption private ReusableFieldsForm reusableFields;

  @MenuOption private ComplexChoiceForm complexChoices;

}
