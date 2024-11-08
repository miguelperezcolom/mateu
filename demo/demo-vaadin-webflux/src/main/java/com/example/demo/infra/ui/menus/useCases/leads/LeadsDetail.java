package com.example.demo.infra.ui.menus.useCases.leads;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;

@Service
@Scope("prototype")
public class LeadsDetail extends LeadDetailDefinition {

  @Autowired @JsonIgnore LeadEditor editor;

  public LeadsDetail() throws MalformedURLException {
    super();
  }

  public void load(String id) {
    setId(id);
    setName("North Sails");
  }

  @Action("Save")
  public LeadEditor retrieveEditor() throws Throwable {
    editor.load(getId());
    return editor;
  }
}
