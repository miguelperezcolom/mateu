package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JourneyDto {

    String type;
    List<InputDto> inputs;

}
