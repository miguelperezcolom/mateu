package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import java.net.MalformedURLException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class LeadsDetail extends LeadDetailDefinition implements ReadOnlyPojo<String> {

  @Autowired @JsonIgnore LeadEditor editor;

  public LeadsDetail() throws MalformedURLException {
    super();
  }

  @Override
  public void load(String id) throws Throwable {
    setId(id);
    setName("North Sails");
  }

  @Override
  public Object retrieveId() {
    return getId();
  }

  @Override
  public LeadEditor retrieveEditor() throws Throwable {
    editor.load(getId());
    return editor;
  }
}