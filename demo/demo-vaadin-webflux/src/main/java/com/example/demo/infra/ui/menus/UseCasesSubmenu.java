package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.useCases.cms.CmsMenu;
import com.example.demo.infra.ui.menus.useCases.insurance.newLife.InsuredInformationForm;
import com.example.demo.infra.ui.menus.useCases.intermediaries.IntermediariesCrud;
import com.example.demo.infra.ui.menus.useCases.leads.LeadsCrud;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.ui.QAMenu;
import com.example.demo.infra.ui.menus.useCases.processDefinition.ui.ProcessDefinitionMenu;
import com.example.demo.infra.ui.menus.useCases.school.SchoolMenu;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.Submenu;

public class UseCasesSubmenu {

  @MenuOption private InsuredInformationForm sellBadLife;

  @MenuOption private LeadsCrud leads;

  @MenuOption private IntermediariesCrud intermediaries;

  @Submenu
  ProcessDefinitionMenu processDefinition;

  @Submenu("No code QA")
  QAMenu qa;

  @Submenu("CMS")
  CmsMenu cms;

  @Submenu
  SchoolMenu school;
}
