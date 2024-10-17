package com.example.demo.infra.ui.menus;

import io.mateu.core.domain.uidefinition.core.interfaces.Directory;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;
import io.mateu.core.domain.uidefinition.shared.annotations.Submenu;

public class FormsSubmenu implements Directory {

    @Submenu
    FormFieldsSubmenu fields;

    @Submenu
    FormActionsSubmenu actions;

    @Submenu
    FormOthersSubmenu others;


}
