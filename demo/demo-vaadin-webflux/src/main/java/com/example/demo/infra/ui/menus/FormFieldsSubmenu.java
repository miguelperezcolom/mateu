package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.components.forms.ComplexChoiceForm;
import com.example.demo.infra.ui.menus.components.forms.DisableFieldForm;
import com.example.demo.infra.ui.menus.components.forms.ElementForm;
import com.example.demo.infra.ui.menus.components.forms.HideFieldForm;
import com.example.demo.infra.ui.menus.components.forms.MiscellaneousForm;
import com.example.demo.infra.ui.menus.components.forms.ReusableFieldsForm;
import com.example.demo.infra.ui.menus.components.forms.SameLineForm;
import com.example.demo.infra.ui.menus.components.forms.WebComponentForm;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.Submenu;

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
