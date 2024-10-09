package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;

public class FormUsualFieldsSubmenu {

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

}
