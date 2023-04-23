package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife.InsuredInformationForm;
import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.IntermediariesCrud;
import io.mateu.mdd.shared.annotations.MenuOption;

public class UseCasesSubmenu {

    @MenuOption
    private InsuredInformationForm sellBadLife;

    @MenuOption
    private IntermediariesCrud intermediaries;
}
