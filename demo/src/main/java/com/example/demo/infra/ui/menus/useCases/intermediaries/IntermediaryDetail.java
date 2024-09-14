package com.example.demo.infra.ui.menus.useCases.intermediaries;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;

@Service
@Scope("prototype")
@ReadOnly
public class IntermediaryDetail extends IntermediaryDetailDefinition {

  @Autowired @JsonIgnore IntermediaryEditor editor;

  public IntermediaryDetail() throws MalformedURLException {}

  public void load(String id) {
    setId(id);
    setName("North Sails");
    this.getSalesAgents().setIntermediaryId(id);
  }


  @Action("Edit")
  public IntermediaryEditor retrieveEditor() throws Throwable {
    editor.load(getId());
    return editor;
  }
}
