package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter@Setter
public class ProductDto {

    String key;
    String status;
    String product_label;
    String product_description;
    String version_label;
    String version_description;
    String product_type;
    String product_group;
    List<JourneyDto> journeys;

}
