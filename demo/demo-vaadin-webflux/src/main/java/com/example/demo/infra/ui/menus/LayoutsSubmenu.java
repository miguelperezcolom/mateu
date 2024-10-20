package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.actions.ActionReturnsForm;
import com.example.demo.infra.ui.menus.actions.ActionTargetForm;
import com.example.demo.infra.ui.menus.actions.ActionsAsButtonsForm;
import com.example.demo.infra.ui.menus.layouts.*;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;

public class LayoutsSubmenu {

  @MenuOption
  HorizontalLayoutForm horizontalLayout;

  @MenuOption
  VerticalLayoutForm verticalLayout;

  @MenuOption
  SplitLayoutForm splitLayout;

  @MenuOption
  TabLayoutForm tabLayout;

  @MenuOption
  CompleteView completeView;

}
