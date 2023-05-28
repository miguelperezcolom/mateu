package com.example.demoremote.ui.demoApp.menus.useCases.qa.steps;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter@Setter
public class CrudTestStep extends TestStep {

    private String filters;

    private String columns;

    private String detailFields;

    private String editorFields;

    private boolean testList;

    private boolean testAdd;

    private boolean testDetail;

    private boolean testEditor;

    private boolean testSave;


}
