package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife.InsuredInformationForm;
import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.IntermediariesCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.leads.LeadsCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.ui.QAMenu;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.ui.ProcessDefinitionMenu;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;

public class UseCasesSubmenu {

    @MenuOption
    private InsuredInformationForm sellBadLife;

    @MenuOption
    private LeadsCrud leads;

    @MenuOption
    private IntermediariesCrud intermediaries;

    @Submenu
    ProcessDefinitionMenu processDefinition;

    @Submenu("QA")
    QAMenu qa;
}
