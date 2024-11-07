package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.Ignored;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class SaleAgentDetail extends SaleAgentDetailDefinition {

  @Ignored @JsonIgnore @Autowired SaleAgentForm form;

  public void load(String id) {
    setId(id);
    setName("Michael Jordan");
    this.getPasswordResets().setSalesAgentId(id);
  }


  @Action("Edit")
  public Object retrieveEditor() throws Throwable {
    form.load(getId());
    return form;
  }
}
