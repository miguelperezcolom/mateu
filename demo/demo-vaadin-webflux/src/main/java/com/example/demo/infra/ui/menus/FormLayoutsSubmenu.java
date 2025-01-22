package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.components.forms.TabsForm;
import com.example.demo.infra.ui.menus.components.forms.layouts.WithHorizontalLayoutForm;
import com.example.demo.infra.ui.menus.components.forms.layouts.WithTabsForm;
import com.example.demo.infra.ui.menus.components.forms.layouts.WithVerticalLayoutForm;
import io.mateu.uidl.annotations.MenuOption;

public class FormLayoutsSubmenu {

    @MenuOption
    private TabsForm tabs;

    @MenuOption
    WithTabsForm tabs2;

    @MenuOption
    WithHorizontalLayoutForm horizontalLayout;

    @MenuOption
    WithVerticalLayoutForm verticalLayout;

}
