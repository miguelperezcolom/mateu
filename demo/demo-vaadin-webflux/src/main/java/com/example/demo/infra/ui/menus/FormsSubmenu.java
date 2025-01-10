package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.HashConsumer;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.interfaces.Directory;
import io.mateu.uidl.annotations.Submenu;

public class FormsSubmenu implements Directory {

    @Submenu
    FormFieldsSubmenu fields;

    @Submenu
    FormActionsSubmenu actions;

    @Submenu
    FormOthersSubmenu others;

    @MenuOption
    HashConsumer hashConsumer;

}
