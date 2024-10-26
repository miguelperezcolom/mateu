package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class SaleAgentForm extends SaleAgentFormDefinition {

  public void load(String id) {
    setId(id);
    setName("Michael Jordan");
  }

  @Action("Save")
  public void save() {}

  @Override
  public String toString() {
    return name;
  }
}
