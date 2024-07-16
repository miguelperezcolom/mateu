package com.example.demo.infra.ui.menus.useCases.processDefinition.ui;

import com.example.demo.infra.ui.menus.useCases.processDefinition.main.sale.*;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class ProcessDefinitionMenu {

  @MenuOption PollForm poll;

  @MenuOption
  JpaCrud<Flow> flows =
      new JpaCrud<Flow>() {
        @Override
        public List<String> getSearchFilterFields() {
          return List.of("name");
        }
      };

  @MenuOption JpaCrud<Step> steps;

  @MenuOption JpaCrud<Section> sections;

  @MenuOption JpaCrud<FieldGroup> fieldGroups;

  @MenuOption JpaCrud<Field> fields;

  @MenuOption DeployForm deploy;
}
