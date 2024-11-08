package com.example.demo.infra.ui.menus.useCases.intermediaries;

import io.mateu.uidl.annotations.Action;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@Getter
@Setter
public class IntermediaryEditor {

  String id;

  String name;

  public IntermediaryEditor() {}

  public void load(String id) {
    setId(id);
    setName("North Sails");
  }

  @Action("Save")
  public void save() {}
}
