package com.example.demo.infra.ui.menus.useCases.nocodeqa.ui;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.Test;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.interfaces.JpaCrud;

import java.util.List;

public class TestDefinitionSubmenu {

  @MenuOption
  JpaCrud<Test> tests =
      new JpaCrud<Test>() {
        @Override
        public List<String> getSearchFilterFields() {
          return List.of("name", "status", "lastResult", "comments");
        }
      };

  @MenuOption
  JpaCrud<TestStep> steps =
      new JpaCrud<TestStep>() {
        @Override
        public List<String> getSearchFilterFields() {
          return List.of("name", "test", "status", "comment");
        }
      };
}
