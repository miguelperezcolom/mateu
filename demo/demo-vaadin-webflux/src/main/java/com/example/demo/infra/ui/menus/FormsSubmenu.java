package com.example.demo.infra.ui.menus;

import io.mateu.uidl.core.interfaces.Directory;
import io.mateu.uidl.core.annotations.Submenu;

public class FormsSubmenu implements Directory {

    @Submenu
    FormFieldsSubmenu fields;

    @Submenu
    FormActionsSubmenu actions;

    @Submenu
    FormOthersSubmenu others;

}
