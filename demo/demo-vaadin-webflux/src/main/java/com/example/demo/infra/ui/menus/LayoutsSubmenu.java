package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.layouts.*;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MenuOption;

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
