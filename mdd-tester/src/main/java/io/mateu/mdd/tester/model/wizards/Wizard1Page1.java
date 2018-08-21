package io.mateu.mdd.tester.model.wizards;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.interfaces.WizardPage;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;

@Getter@Setter
public class Wizard1Page1 implements WizardPage {

    @NotEmpty
    private String name;

    @Output
    private int age;



    @Action
    public void setRandomName() {
        this.name = "Mateu";
    }

    @Action
    public void askForAge(int age) {
        this.age = age;
    }



    @Override
    public WizardPage getPrevious() {
        return null;
    }

    @Override
    public WizardPage getNext() {
        return null;
    }

}
