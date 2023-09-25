package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JourneyDto {

  String type;
  List<InputDto> inputs;
}
