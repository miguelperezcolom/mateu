package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.components.forms.actions.ActionReturnsForm;
import com.example.demo.infra.ui.menus.components.forms.actions.ActionTargetForm;
import com.example.demo.infra.ui.menus.components.forms.actions.ActionsAsButtonsForm;
import com.example.demo.infra.ui.menus.components.forms.ActionsWithParametersForm;
import com.example.demo.infra.ui.menus.components.forms.AutoReloadForm;
import com.example.demo.infra.ui.menus.components.forms.CallActionOnChangeFieldForm;
import com.example.demo.infra.ui.menus.components.forms.CallActionOnChecksForm;
import com.example.demo.infra.ui.menus.components.forms.CallActionOnFileUploadForm;
import com.example.demo.infra.ui.menus.components.forms.DisableActionForm;
import com.example.demo.infra.ui.menus.components.forms.FormWithCallbacks;
import com.example.demo.infra.ui.menus.components.forms.HideActionForm;
import com.example.demo.infra.ui.menus.components.forms.ReturnsBasic;
import com.example.demo.infra.ui.menus.components.forms.ReturnsResult;
import io.mateu.uidl.annotations.MenuOption;

public class FormActionsSubmenu {

  @MenuOption private AutoReloadForm autoReload;

  @MenuOption private FormWithCallbacks formWithCallbacks;

  @MenuOption private ReturnsBasic returnsBasic;

  @MenuOption private ReturnsResult returnsResult;

  @MenuOption private HideActionForm hideAction;

  @MenuOption private DisableActionForm disableAction;

  @MenuOption private CallActionOnChangeFieldForm callActionOnChange;

  @MenuOption private CallActionOnChecksForm callActionOnCheck;

  @MenuOption private CallActionOnFileUploadForm callActionOnFileUpload;

  @MenuOption private ActionsWithParametersForm actionsWithParameters;

  @MenuOption
  ActionTargetForm targets;

  @MenuOption
  ActionReturnsForm returnTypes;

  @MenuOption
  ActionsAsButtonsForm actionsAsButtons;
}
