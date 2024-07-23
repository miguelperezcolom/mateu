package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents.SalesAgentsCrud;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

@Getter
@Setter
public abstract class BrokenDetailDefinition {

  String id;

  String name;

  @Autowired
  SalesAgentsCrud salesAgents;
}
