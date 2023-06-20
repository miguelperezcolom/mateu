package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.ui;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.Test;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.Input;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

public class TestDefinitionSubmenu {

    @MenuOption
    JpaCrud<Test> tests;

    @MenuOption
    JpaCrud<TestStep> steps;
}
