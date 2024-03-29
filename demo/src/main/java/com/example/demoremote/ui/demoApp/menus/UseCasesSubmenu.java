package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.useCases.cms.CmsMenu;
import com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife.InsuredInformationForm;
import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.IntermediariesCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.leads.LeadsCrud;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.ui.QAMenu;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.ui.ProcessDefinitionMenu;
import com.example.demoremote.ui.demoApp.menus.useCases.school.SchoolMenu;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;

public class UseCasesSubmenu {

  @MenuOption private InsuredInformationForm sellBadLife;

  @MenuOption private LeadsCrud leads;

  @MenuOption private IntermediariesCrud intermediaries;

  @Submenu ProcessDefinitionMenu processDefinition;

  @Submenu("No code QA")
  QAMenu qa;

  @Submenu("CMS")
  CmsMenu cms;

  @Submenu SchoolMenu school;
}
