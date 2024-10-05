package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;
import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter;

public class FormFieldsSubmenu {

  @MenuOption
  BasicFieldsForm basicFields;
  @MenuOption private TextFieldsForm text;

  @MenuOption private VaadinRichTextFieldForm richTextUsingVaadin;

  @MenuOption private NumberFieldsForm numbers;

  @MenuOption private BooleanFieldsForm checks;

  @MenuOption private DatesFieldsForm dates;

  @MenuOption private PatternValidatedFieldForm pattern;

  @MenuOption private TelephoneFieldForm telephone;

  @MenuOption private EnumFieldsForm enums;

  @MenuOption private NestedDropdownsForm nestedDropdowns;

  @MenuOption private WrappersFieldsForm wrappersFieldsForm;

  @MenuOption private UrlAndTextForm urlAndText;

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
