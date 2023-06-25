package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.ui;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.environments.Environment;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.executions.TestExecution;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.Test;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.mdd.shared.interfaces.JpaCrud;

public class QAMenu {

    @MenuOption
    JpaCrud<Test> tests;

    @MenuOption
    JpaCrud<TestExecution> executions;

    @MenuOption
    JpaCrud<Environment> environments;
}
