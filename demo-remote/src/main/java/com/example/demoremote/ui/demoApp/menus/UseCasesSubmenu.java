package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife.InsuredInformationForm;
import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.IntermediariesCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.leads.LeadsCrud;
import io.mateu.mdd.shared.annotations.MenuOption;

public class UseCasesSubmenu {

    @MenuOption
    private InsuredInformationForm sellBadLife;

    @MenuOption
    private LeadsCrud leads;

    @MenuOption
    private IntermediariesCrud intermediaries;
}
