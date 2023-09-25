package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InputDto {

  String key;
  String type;
  String label;
  List<String> validations = new ArrayList<>();
}
