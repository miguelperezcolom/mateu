package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@ReadOnly
public class BrokenDetail extends BrokenDetailDefinition {

  @Autowired @JsonIgnore BrokenEditor editor;

  public BrokenDetail() {}

  public void load(String id) {
    setId(id);
    setName("North Sails");
    this.getSalesAgents().setIntermediaryId(id);
  }

  @Action("Edit")
  public BrokenEditor retrieveEditor() throws Throwable {
    editor.load(getId());
    return editor;
  }
}
