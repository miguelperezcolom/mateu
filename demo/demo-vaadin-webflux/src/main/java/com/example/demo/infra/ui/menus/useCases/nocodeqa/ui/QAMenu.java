package com.example.demo.infra.ui.menus.useCases.nocodeqa.ui;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.environments.Environment;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.executions.TestExecution;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.Test;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.interfaces.JpaCrud;

public class QAMenu {

  @MenuOption JpaCrud<Test> tests;

  @MenuOption JpaCrud<TestExecution> executions;

  @MenuOption JpaCrud<Environment> environments;
}
