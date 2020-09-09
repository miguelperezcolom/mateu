package io.mateu.showcase.tester.model.wizards;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.interfaces.WizardPage;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.validation.constraints.NotEmpty;

@Getter@Setter@ToString
public class Wizard1Page1 implements WizardPage {

    @NotEmpty
    private String name;

    private int age;

    @Output
    private int friends;

    @Action
    public void setRandomName() {
        this.name = "Mateu";
    }

    @Action
    public void askForFriends(int numberOfFriends) {
        setFriends(numberOfFriends);
    }



    @Override
    public WizardPage getPrevious() {
        return null;
    }

    @Override
    public boolean hasNext() {
        return true;
    }

    @Override
    public WizardPage getNext() {
        return new Wizard1Page2(this);
    }


    @Override
    public boolean isValid() {
        return age > 10;
    }
}
