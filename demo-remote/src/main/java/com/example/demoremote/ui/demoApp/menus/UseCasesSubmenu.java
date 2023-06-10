package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife.InsuredInformationForm;
import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.IntermediariesCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.leads.LeadsCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.ui.ProcessDefinitionMenu;
import com.example.demoremote.ui.demoApp.menus.useCases.qa.steps.TestStep;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.mdd.shared.interfaces.JpaCrud;

public class UseCasesSubmenu {

    @MenuOption
    private InsuredInformationForm sellBadLife;

    @MenuOption
    private LeadsCrud leads;

    @MenuOption
    private IntermediariesCrud intermediaries;

    @MenuOption
    private JpaCrud<TestStep> testSteps;

    @Submenu
    ProcessDefinitionMenu processDefinition;
}
