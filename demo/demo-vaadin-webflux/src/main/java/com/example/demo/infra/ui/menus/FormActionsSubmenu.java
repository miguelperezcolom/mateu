package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.actions.ActionReturnsForm;
import com.example.demo.infra.ui.menus.actions.ActionTargetForm;
import com.example.demo.infra.ui.menus.actions.ActionsAsButtonsForm;
import com.example.demo.infra.ui.menus.forms.*;
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
