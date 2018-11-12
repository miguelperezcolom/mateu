package io.mateu.mdd.tester.model.wizards;

import io.mateu.mdd.core.annotations.Wizard;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class WizardEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @Wizard(Wizard2Page1.class)
    private int value;

}
