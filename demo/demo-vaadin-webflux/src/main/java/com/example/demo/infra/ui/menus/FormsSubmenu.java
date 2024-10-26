package com.example.demo.infra.ui.menus;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Directory;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Submenu;

public class FormsSubmenu implements Directory {

    @Submenu
    FormFieldsSubmenu fields;

    @Submenu
    FormActionsSubmenu actions;

    @Submenu
    FormOthersSubmenu others;

}
