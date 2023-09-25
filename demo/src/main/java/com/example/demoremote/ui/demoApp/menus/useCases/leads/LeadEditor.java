package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.shared.data.TelephoneNumber;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@Getter
@Setter
public class LeadEditor implements PersistentPojo<String> {

  String id;

  String name;

  TelephoneNumber homeTelephone;

  TelephoneNumber workTelephone;

  public LeadEditor() {}

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
  public void save() throws Throwable {}
}
