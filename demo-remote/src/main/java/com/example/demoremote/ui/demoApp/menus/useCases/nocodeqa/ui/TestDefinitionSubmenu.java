package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.ui;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.Test;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.Input;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class TestDefinitionSubmenu {

    @MenuOption
    JpaCrud<Test> tests = new JpaCrud<Test>() {
        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name","status","lastResult","comments");
        }
    };

    @MenuOption
    JpaCrud<TestStep> steps = new JpaCrud<TestStep>() {
        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name", "test", "status", "comment");
        }
    };
}
