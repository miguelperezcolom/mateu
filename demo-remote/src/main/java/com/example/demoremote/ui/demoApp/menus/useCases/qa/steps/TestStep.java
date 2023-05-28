package com.example.demoremote.ui.demoApp.menus.useCases.qa.steps;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter@Setter
public class TestStep {

    @Id
    private String id;

    private String name;

    private String menuOption;

}
