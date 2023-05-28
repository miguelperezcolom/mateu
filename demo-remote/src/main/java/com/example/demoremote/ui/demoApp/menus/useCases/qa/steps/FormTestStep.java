package com.example.demoremote.ui.demoApp.menus.useCases.qa.steps;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter@Setter
public class FormTestStep extends TestStep {

    private String fields;

    private String action;

    private String expectedResult;

}
