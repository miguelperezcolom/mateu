package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.ReadOnlyPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class BrokenDetail extends BrokenDetailDefinition implements ReadOnlyPojo<String> {

  @Autowired @JsonIgnore BrokenEditor editor;

  public BrokenDetail() {}

  @Override
  public void load(String id) throws Throwable {
    setId(id);
    setName("North Sails");
    this.getSalesAgents().setIntermediaryId(id);
  }

  @Override
  public Object retrieveId() {
    return getId();
  }

  @Override
  public BrokenEditor retrieveEditor() throws Throwable {
    editor.load(getId());
    return editor;
  }
}
