package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.actions.ActionTargetForm;
import com.example.demo.infra.ui.menus.errors.rpcTimeouts.BrokenCrud;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;

public class ActionsSubmenu {

  @MenuOption private ActionTargetForm targets  ;
}
