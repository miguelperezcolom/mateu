package com.example.demo.infra.ui.menus.useCases.processDefinition.poller.dtos;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class InputDto {

  String key;
  String type;
  String label;
  List<String> validations = new ArrayList<>();
}
