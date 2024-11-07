package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import io.mateu.uidl.core.annotations.Action;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@Getter
@Setter
public class BrokenEditor {

  String id;

  String name;

  public BrokenEditor() {}

  public void load(String id) {
    setId(id);
    setName("North Sails");
  }

  @Action("Save")
  public void save() {}
}
