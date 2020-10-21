package org.example.application.ui;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.*;
import org.example.application.ui.simpleUI.ConfigMenu;
import org.example.application.ui.simpleUI.PersonsRpcView;
import org.example.application.ui.wizards.WizardPage1;
import org.example.domain.boundaries.common.entities.Person;

@MateuUI(path = "")
public class SimpleUI {

    @Submenu
    ConfigMenu config;

    @MenuOption
    Class persons = Person.class;

    @MenuOption
            @Columns("name,birthDate")
            @FilterFields("name,nationality")
            @EditableFields("name,financialAgent")
    Class customizedPersons = Person.class;

    @MenuOption
    PersonsRpcView personsView;

    @MenuOption
    WizardPage1 wizard;

    @Home
    String msg = "Hello world";

}
