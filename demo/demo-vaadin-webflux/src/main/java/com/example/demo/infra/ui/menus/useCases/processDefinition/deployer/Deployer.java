package com.example.demo.infra.ui.menus.useCases.processDefinition.deployer;

import com.example.demo.infra.ui.menus.useCases.processDefinition.main.sale.Flow;
import org.springframework.stereotype.Service;

/**
 * the mission of the deployer is to generate the camunda xml and jsons and use the api to deploy
 * them to Camunda
 */
@Service
public class Deployer {

  public void deploy(Flow process) {}
}
