package com.example.demo.infra.ui.menus.useCases.intermediaries;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;

@Service
@Scope("prototype")
public class IntermediaryDetail extends IntermediaryDetailDefinition
    implements ReadOnlyPojo<String> {

  @Autowired @JsonIgnore IntermediaryEditor editor;

  public IntermediaryDetail() throws MalformedURLException {}

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
  public IntermediaryEditor retrieveEditor() throws Throwable {
    editor.load(getId());
    return editor;
  }
}
