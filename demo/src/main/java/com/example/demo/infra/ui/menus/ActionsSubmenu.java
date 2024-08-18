package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.actions.ActionReturnsForm;
import com.example.demo.infra.ui.menus.actions.ActionTargetForm;
import com.example.demo.infra.ui.menus.actions.ActionsAsButtonsForm;
import com.example.demo.infra.ui.menus.errors.rpcTimeouts.BrokenCrud;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;

public class ActionsSubmenu {

  @MenuOption ActionTargetForm targets;

  @MenuOption
  ActionReturnsForm returnTypes;

  @MenuOption
  ActionsAsButtonsForm actionsAsButtons;

}
