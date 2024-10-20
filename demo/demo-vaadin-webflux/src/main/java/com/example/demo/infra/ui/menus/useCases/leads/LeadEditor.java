package com.example.demo.infra.ui.menus.useCases.leads;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.data.TelephoneNumber;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@Getter
@Setter
public class LeadEditor {

  String id;

  String name;

  TelephoneNumber homeTelephone;

  TelephoneNumber workTelephone;

  public LeadEditor() {}

  public void load(String id) {
    setId(id);
    setName("North Sails");
  }

  @Action("Save")
  public void save() {}
}
